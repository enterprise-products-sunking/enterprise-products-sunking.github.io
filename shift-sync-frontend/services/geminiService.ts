import { GoogleGenAI, Type } from "@google/genai";
import { Employee, Shift, ShiftStatus } from '../types';
import { addDays, format, startOfWeek } from 'date-fns';

const createClient = () => {
    // In a real app, we check process.env.API_KEY. 
    // If missing, we might return a mock client or throw an error caught by UI.
    const apiKey = process.env.API_KEY || ''; 
    return new GoogleGenAI({ apiKey });
};

export const generateSchedule = async (
    employees: Employee[], 
    weekStart: Date,
    existingShifts: Shift[]
): Promise<Shift[]> => {
    const ai = createClient();
    
    // Safety check for demo purposes if no key provided
    if (!process.env.API_KEY) {
        console.warn("No API Key found. Returning mock generated shifts.");
        // Return a mock delayed response for UI simulation
        return new Promise(resolve => {
            setTimeout(() => {
                const newShifts: Shift[] = employees.map((emp, idx) => ({
                    id: `ai-gen-${Date.now()}-${idx}`,
                    employeeId: emp.id,
                    start: addDays(weekStart, idx + 1), // Spread over the week
                    end: addDays(weekStart, idx + 1), // Placeholder logic
                    role: emp.role,
                    status: ShiftStatus.Pending,
                    notes: "AI Suggested"
                })).map(s => {
                    // Set times manually for mock
                    s.start.setHours(9, 0, 0, 0);
                    s.end.setHours(17, 0, 0, 0);
                    return s;
                });
                resolve(newShifts);
            }, 1500);
        });
    }

    const employeeData = employees.map(e => ({
        id: e.id,
        name: e.name,
        role: e.role,
        department: e.department,
        maxHours: e.maxHours
    }));

    const startDateStr = format(weekStart, 'yyyy-MM-dd');
    
    const prompt = `
        You are an intelligent shift scheduler.
        I need to generate a schedule for the week starting ${startDateStr}.
        
        Employees available:
        ${JSON.stringify(employeeData)}

        Please generate a list of shifts. 
        - Ensure 9am-5pm coverage for 'Front of House'.
        - Ensure 10am-10pm coverage for 'Kitchen'.
        - Respect maxHours constraints.
        - Create 5-8 shifts total for the remaining empty slots in the week.
        
        Return ONLY a JSON array of objects.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            employeeId: { type: Type.STRING },
                            dayOffset: { type: Type.INTEGER, description: "0 for Monday, 1 for Tuesday... 6 for Sunday" },
                            startHour: { type: Type.INTEGER },
                            durationHours: { type: Type.NUMBER },
                            role: { type: Type.STRING }
                        }
                    }
                }
            }
        });

        const rawData = JSON.parse(response.text || '[]');
        
        // Transform the AI response back into App Shift objects
        const generatedShifts: Shift[] = rawData.map((item: any, index: number) => {
            const shiftDate = addDays(weekStart, item.dayOffset);
            const start = new Date(shiftDate);
            start.setHours(item.startHour, 0, 0, 0);
            
            const end = new Date(start);
            end.setHours(start.getHours() + Math.floor(item.durationHours), (item.durationHours % 1) * 60, 0, 0);

            return {
                id: `ai-${Date.now()}-${index}`,
                employeeId: item.employeeId,
                start: start,
                end: end,
                role: item.role,
                status: ShiftStatus.Pending,
                notes: "AI Generated"
            };
        });

        return generatedShifts;

    } catch (error) {
        console.error("AI Scheduling failed", error);
        return [];
    }
};
