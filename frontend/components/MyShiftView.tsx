"use client";

import React, { useState, useMemo } from 'react';
import {
    Calendar as CalendarIcon,
    Clock,
    MapPin,
    ArrowLeftRight,
    ClipboardCheck,
    Info,
    User,
    TrendingUp,
    CheckCircle2,
    ArrowRight,
    Check,
    X,
    Repeat
} from 'lucide-react';
import { format, isSameDay, isToday, isPast, startOfDay } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Shift, Employee } from '../types';
import { toast } from 'sonner';

// Extended shift type for my shifts view
interface MyShift {
    id: string;
    title: string;
    date: Date;
    startTime: string;
    endTime: string;
    location: string;
    status: 'scheduled' | 'pending_switch' | 'swapped';
    pendingExchangeWith?: string; // ID of shift being exchanged
}

interface MarketplaceShift {
    id: string;
    title: string;
    date: Date;
    dateDisplay: string;
    startTime: string;
    endTime: string;
    location: string;
    ownerName: string;
    ownerAvatar?: string;
    offeredShiftTitle?: string; // What the owner is offering in exchange
}

interface MyShiftViewProps {
    employees: Employee[];
    shifts: Shift[];
}

// Get shift time status
type TimeStatus = 'past' | 'current' | 'upcoming';

const getShiftTimeStatus = (shiftDate: Date): TimeStatus => {
    if (isToday(shiftDate)) return 'current';
    if (isPast(startOfDay(shiftDate)) && !isToday(shiftDate)) return 'past';
    return 'upcoming';
};

// Time status colors
const timeStatusStyles: Record<TimeStatus, { bg: string; border: string; text: string; badge: string; label: string }> = {
    past: { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-400', badge: 'bg-slate-100 text-slate-500', label: 'Past' },
    current: { bg: 'bg-emerald-50/50', border: 'border-emerald-200', text: 'text-emerald-700', badge: 'bg-emerald-100 text-emerald-700', label: 'Today' },
    upcoming: { bg: 'bg-amber-50/50', border: 'border-amber-200', text: 'text-amber-700', badge: 'bg-amber-100 text-amber-700', label: 'Upcoming' },
};

const getDateBadgeStyle = (status: TimeStatus) => {
    switch (status) {
        case 'past': return 'bg-slate-200 text-slate-500';
        case 'current': return 'bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-emerald-500/20';
        case 'upcoming': return 'bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-amber-500/20';
    }
};

const MyShiftView: React.FC<MyShiftViewProps> = ({ employees, shifts }) => {
    // Modal states
    const [isExchangeModalOpen, setIsExchangeModalOpen] = useState(false);
    const [isMarketplaceExchangeOpen, setIsMarketplaceExchangeOpen] = useState(false);
    const [exchangeStep, setExchangeStep] = useState<1 | 2 | 3>(1);

    // Selection states
    const [selectedShift, setSelectedShift] = useState<MyShift | null>(null);
    const [selectedMarketplaceShift, setSelectedMarketplaceShift] = useState<MarketplaceShift | null>(null);
    const [shiftToOffer, setShiftToOffer] = useState<MyShift | null>(null);
    const [exchangeNote, setExchangeNote] = useState('');

    // Calendar state
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

    // Mock data for my shifts
    const [myShifts, setMyShifts] = useState<MyShift[]>([
        { id: '1', title: 'Morning Shift - Front Desk', date: new Date(2026, 0, 27), startTime: '09:00', endTime: '17:00', location: 'Main Office, Floor 1', status: 'scheduled' },
        { id: '2', title: 'Evening Shift - Customer Support', date: new Date(2026, 0, 28), startTime: '14:00', endTime: '22:00', location: 'Support Center', status: 'pending_switch', pendingExchangeWith: 'm1' },
        { id: '3', title: 'Night Shift - Security', date: new Date(2026, 0, 22), startTime: '22:00', endTime: '06:00', location: 'Building B', status: 'scheduled' },
        { id: '4', title: 'Day Shift - Reception', date: new Date(), startTime: '08:00', endTime: '16:00', location: 'Main Lobby', status: 'scheduled' },
        { id: '5', title: 'Afternoon Shift - Support', date: new Date(2026, 0, 30), startTime: '12:00', endTime: '20:00', location: 'Support Center', status: 'scheduled' },
    ]);

    // Mock marketplace shifts (these are shifts other users want to exchange)
    const [marketShifts, setMarketShifts] = useState<MarketplaceShift[]>([
        { id: 'm1', title: 'Weekend Shift - Reception', date: new Date(2026, 0, 25), dateDisplay: 'Sat, Jan 25', startTime: '10:00', endTime: '18:00', location: 'Main Lobby', ownerName: 'Sarah Chen', offeredShiftTitle: 'Looking to swap for any weekday shift' },
        { id: 'm2', title: 'Holiday Coverage', date: new Date(2026, 0, 29), dateDisplay: 'Wed, Jan 29', startTime: '08:00', endTime: '16:00', location: 'Branch Office', ownerName: 'Marcus Johnson', offeredShiftTitle: 'Will exchange for evening shift' },
    ]);

    // Get eligible shifts for exchange (upcoming, not pending)
    const eligibleShiftsForExchange = useMemo(() => {
        return myShifts.filter(s =>
            getShiftTimeStatus(s.date) === 'upcoming' &&
            s.status === 'scheduled'
        );
    }, [myShifts]);

    // Filter shifts for selected date
    const shiftsForSelectedDate = useMemo(() => {
        if (!selectedDate) return [];
        return myShifts.filter(shift => isSameDay(shift.date, selectedDate));
    }, [myShifts, selectedDate]);

    const shiftDates = useMemo(() => myShifts.map(s => s.date), [myShifts]);

    // Stats
    const upcomingCount = myShifts.filter(s => getShiftTimeStatus(s.date) === 'upcoming').length;
    const currentCount = myShifts.filter(s => getShiftTimeStatus(s.date) === 'current').length;
    const pendingCount = myShifts.filter(s => s.status === 'pending_switch').length;

    // Sorted shifts
    const sortedShifts = useMemo(() => {
        return [...myShifts].sort((a, b) => {
            const statusOrder = { current: 0, upcoming: 1, past: 2 };
            const aStatus = getShiftTimeStatus(a.date);
            const bStatus = getShiftTimeStatus(b.date);
            if (aStatus !== bStatus) return statusOrder[aStatus] - statusOrder[bStatus];
            return a.date.getTime() - b.date.getTime();
        });
    }, [myShifts]);

    // === Exchange Flow Handlers ===

    // Start exchange from My Schedule (user wants to swap their shift)
    const handleRequestSwitch = (shift: MyShift) => {
        setSelectedShift(shift);
        setShiftToOffer(null);
        setExchangeStep(1);
        setExchangeNote('');
        setIsExchangeModalOpen(true);
    };

    // Start exchange from Marketplace (user wants to take someone's shift)
    const handlePickupShift = (marketShift: MarketplaceShift) => {
        setSelectedMarketplaceShift(marketShift);
        setShiftToOffer(null);
        setExchangeStep(1);
        setExchangeNote('');
        setIsMarketplaceExchangeOpen(true);
    };

    // Confirm exchange request (from My Schedule)
    const confirmExchangeRequest = () => {
        if (!selectedShift) return;

        // Update shift status to pending
        setMyShifts(prev => prev.map(s =>
            s.id === selectedShift.id
                ? { ...s, status: 'pending_switch' as const }
                : s
        ));

        // Add to marketplace
        const newMarketShift: MarketplaceShift = {
            id: `m-${Date.now()}`,
            title: selectedShift.title,
            date: selectedShift.date,
            dateDisplay: format(selectedShift.date, 'EEE, MMM d'),
            startTime: selectedShift.startTime,
            endTime: selectedShift.endTime,
            location: selectedShift.location,
            ownerName: 'You',
            offeredShiftTitle: exchangeNote || 'Looking for any compatible shift'
        };
        setMarketShifts(prev => [...prev, newMarketShift]);

        setIsExchangeModalOpen(false);
        toast.success('Shift posted to marketplace!', {
            description: 'Other staff can now propose an exchange.'
        });
    };

    // Confirm marketplace exchange (user takes someone's shift)
    const confirmMarketplaceExchange = () => {
        if (!selectedMarketplaceShift || !shiftToOffer) return;

        // Update the offered shift to pending
        setMyShifts(prev => prev.map(s =>
            s.id === shiftToOffer.id
                ? { ...s, status: 'pending_switch' as const, pendingExchangeWith: selectedMarketplaceShift.id }
                : s
        ));

        // Remove from marketplace
        setMarketShifts(prev => prev.filter(s => s.id !== selectedMarketplaceShift.id));

        setIsMarketplaceExchangeOpen(false);
        toast.success('Exchange request sent!', {
            description: `Waiting for ${selectedMarketplaceShift.ownerName} to confirm.`
        });
    };

    const resetExchangeModal = () => {
        setExchangeStep(1);
        setShiftToOffer(null);
        setExchangeNote('');
    };

    return (
        <div className="flex-1 overflow-auto p-6 bg-gradient-to-br from-slate-50 to-slate-100/50">
            {/* Header */}
            <div className="mb-6">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
                    <h1 className="text-2xl font-bold text-slate-900">My Shifts</h1>
                    <p className="text-sm text-slate-500 mt-1">Manage your schedule and exchange shifts with colleagues</p>
                </motion.div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                {[
                    { label: "Today", count: currentCount, sub: "active shifts", icon: CheckCircle2, color: "emerald" },
                    { label: "Upcoming", count: upcomingCount, sub: "scheduled shifts", icon: CalendarIcon, color: "amber" },
                    { label: "Pending", count: pendingCount, sub: "exchange requests", icon: Repeat, color: "blue" },
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                    >
                        <Card className="bg-white/80 backdrop-blur border-slate-200/60 shadow-sm hover:shadow-md transition-all">
                            <CardContent className="p-5">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{stat.label}</p>
                                        <p className="text-3xl font-bold text-slate-900 mt-1">{stat.count}</p>
                                        <p className="text-xs text-slate-400 mt-1">{stat.sub}</p>
                                    </div>
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg bg-gradient-to-br from-${stat.color}-500 to-${stat.color}-600 shadow-${stat.color}-500/20`}>
                                        <stat.icon className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Main Content */}
            <Card className="bg-white/90 backdrop-blur border-slate-200/60 shadow-sm overflow-hidden">
                <Tabs defaultValue="my_shifts" className="w-full">
                    <CardHeader className="pb-0 border-b border-slate-100">
                        <TabsList variant="line" className="gap-0 bg-transparent p-0">
                            <TabsTrigger value="my_shifts" className="relative px-6 py-3 text-sm font-medium data-[state=active]:text-blue-600 data-[state=inactive]:text-slate-500 hover:text-slate-700 rounded-none bg-transparent">
                                My Schedule
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 opacity-0 transition-opacity data-[state=active]:opacity-100" />
                            </TabsTrigger>
                            <TabsTrigger value="marketplace" className="relative px-6 py-3 text-sm font-medium data-[state=active]:text-blue-600 data-[state=inactive]:text-slate-500 hover:text-slate-700 rounded-none bg-transparent flex items-center gap-2">
                                Shift Exchange
                                {marketShifts.length > 0 && (
                                    <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded-full">{marketShifts.length}</span>
                                )}
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 opacity-0 transition-opacity data-[state=active]:opacity-100" />
                            </TabsTrigger>
                        </TabsList>
                    </CardHeader>

                    {/* My Schedule Content */}
                    <TabsContent value="my_shifts" className="p-0">
                        <div className="flex flex-col lg:flex-row">
                            {/* Calendar Section */}
                            <div className="lg:w-80 border-b lg:border-b-0 lg:border-r border-slate-100 p-4">
                                <Calendar
                                    mode="single"
                                    selected={selectedDate}
                                    onSelect={setSelectedDate}
                                    className="rounded-lg"
                                    modifiers={{ hasShift: shiftDates }}
                                    modifiersStyles={{ hasShift: { fontWeight: 'bold', textDecoration: 'underline', textDecorationColor: '#3b82f6' } }}
                                />
                                <div className="mt-4 space-y-2 px-2">
                                    <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-3">Legend</p>
                                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500"></div><span className="text-xs text-slate-600">Today's Shift</span></div>
                                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-amber-500"></div><span className="text-xs text-slate-600">Upcoming Shift</span></div>
                                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-slate-300"></div><span className="text-xs text-slate-600">Past Shift</span></div>
                                </div>
                            </div>

                            {/* Shifts List */}
                            <div className="flex-1 p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <div>
                                        <h2 className="text-sm font-semibold text-slate-700">
                                            {selectedDate ? format(selectedDate, 'EEEE, MMMM d, yyyy') : 'All Shifts'}
                                        </h2>
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={() => setSelectedDate(undefined)} className="text-xs text-blue-600 hover:text-blue-700">
                                        Show All
                                    </Button>
                                </div>

                                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                    <AnimatePresence mode='popLayout'>
                                        {(selectedDate ? shiftsForSelectedDate : sortedShifts).length === 0 ? (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                className="text-center py-12 bg-slate-50/50 rounded-xl border border-dashed border-slate-200"
                                            >
                                                <CalendarIcon className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                                                <p className="text-slate-500 font-medium">No shifts on this day</p>
                                            </motion.div>
                                        ) : (
                                            (selectedDate ? shiftsForSelectedDate : sortedShifts).map((shift, idx) => {
                                                const timeStatus = getShiftTimeStatus(shift.date);
                                                const statusStyles = timeStatusStyles[timeStatus];
                                                const dateBadgeStyle = getDateBadgeStyle(timeStatus);

                                                return (
                                                    <motion.div
                                                        key={shift.id}
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, scale: 0.95 }}
                                                        transition={{ delay: idx * 0.05 }}
                                                        className={`group rounded-xl p-4 border transition-all hover:shadow-md ${statusStyles.bg} ${statusStyles.border} ${timeStatus === 'past' ? 'opacity-70' : ''}`}
                                                    >
                                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                            <div className="flex items-start gap-4">
                                                                <div className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center font-bold shadow-sm flex-shrink-0 ${dateBadgeStyle}`}>
                                                                    <span className="text-[10px] uppercase tracking-wide opacity-80">{format(shift.date, 'EEE')}</span>
                                                                    <span className="text-xl leading-none">{format(shift.date, 'd')}</span>
                                                                    <span className="text-[10px] uppercase tracking-wide opacity-80">{format(shift.date, 'MMM')}</span>
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-center gap-2 flex-wrap mb-2">
                                                                        <h3 className={`font-semibold text-slate-800 ${timeStatus === 'past' ? 'text-slate-500' : ''}`}>{shift.title}</h3>
                                                                        <Badge variant="outline" className={`text-xs font-medium ${statusStyles.badge}`}>{statusStyles.label}</Badge>
                                                                        {shift.status === 'pending_switch' && (
                                                                            <Badge variant="outline" className="text-xs font-medium bg-blue-100 text-blue-700 border-blue-200">
                                                                                <Repeat className="w-3 h-3 mr-1" /> Pending Exchange
                                                                            </Badge>
                                                                        )}
                                                                    </div>
                                                                    <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                                                                        <div className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-slate-400" /><span>{shift.startTime} - {shift.endTime}</span></div>
                                                                        <div className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-slate-400" /><span>{shift.location}</span></div>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center gap-2 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                                                {timeStatus !== 'past' && shift.status === 'scheduled' && (
                                                                    <Button variant="outline" size="sm" onClick={() => handleRequestSwitch(shift)} className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300">
                                                                        <ArrowLeftRight className="w-4 h-4 mr-2" />
                                                                        Exchange Shift
                                                                    </Button>
                                                                )}
                                                                {shift.status === 'pending_switch' && (
                                                                    <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full">
                                                                        <Clock className="w-4 h-4" />
                                                                        <span className="font-medium">Awaiting exchange</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                );
                                            })
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    {/* Marketplace Content */}
                    <TabsContent value="marketplace" className="p-6">
                        <div className="space-y-4">
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
                                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Repeat className="w-4 h-4 text-blue-600" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-semibold text-blue-900">How Shift Exchange Works</h4>
                                    <p className="text-sm text-blue-700 mt-0.5">
                                        Browse shifts your colleagues want to exchange. To accept, you must <strong>offer one of your own shifts</strong> in return. Both parties must agree for the swap to complete.
                                    </p>
                                </div>
                            </div>

                            {marketShifts.length === 0 ? (
                                <div className="text-center py-16 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                                    <ClipboardCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                    <p className="text-slate-500 font-medium">No exchange requests</p>
                                    <p className="text-sm text-slate-400 mt-1">Check back later for opportunities</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {marketShifts.map((shift, i) => (
                                        <motion.div
                                            key={shift.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.1 }}
                                            className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition-all"
                                        >
                                            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs font-semibold px-3 py-1.5 flex items-center gap-1.5">
                                                <Repeat className="w-3.5 h-3.5" />
                                                Available for Exchange
                                            </div>

                                            <div className="p-5">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <Avatar className="w-10 h-10 border-2 border-white shadow-sm">
                                                        <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(shift.ownerName)}&background=random`} alt={shift.ownerName} />
                                                        <AvatarFallback className="bg-blue-100 text-blue-600">{shift.ownerName.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="text-sm font-semibold text-slate-800">{shift.ownerName}</p>
                                                        <p className="text-xs text-slate-500">wants to exchange</p>
                                                    </div>
                                                </div>

                                                <h3 className="font-bold text-slate-900 mb-2">{shift.title}</h3>

                                                {shift.offeredShiftTitle && (
                                                    <p className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded mb-3 italic">
                                                        "{shift.offeredShiftTitle}"
                                                    </p>
                                                )}

                                                <div className="bg-slate-50 rounded-lg p-3 space-y-2 mb-4">
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className="text-slate-500 flex items-center gap-2"><CalendarIcon className="w-4 h-4" /> Date</span>
                                                        <span className="font-medium text-slate-900">{shift.dateDisplay}</span>
                                                    </div>
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className="text-slate-500 flex items-center gap-2"><Clock className="w-4 h-4" /> Time</span>
                                                        <span className="font-medium text-slate-900">{shift.startTime} - {shift.endTime}</span>
                                                    </div>
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className="text-slate-500 flex items-center gap-2"><MapPin className="w-4 h-4" /> Location</span>
                                                        <span className="font-medium text-slate-900">{shift.location}</span>
                                                    </div>
                                                </div>

                                                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-sm" onClick={() => handlePickupShift(shift)}>
                                                    <ArrowLeftRight className="w-4 h-4 mr-2" />
                                                    Propose Exchange
                                                </Button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </Card>

            {/* Exchange Request Modal (from My Schedule) */}
            <Dialog open={isExchangeModalOpen} onOpenChange={(open) => { setIsExchangeModalOpen(open); if (!open) resetExchangeModal(); }}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <ArrowLeftRight className="w-5 h-5 text-blue-600" />
                            Post Shift for Exchange
                        </DialogTitle>
                        <DialogDescription>
                            Post your shift to the marketplace. Other staff can propose an exchange with their shift.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedShift && (
                        <div className="space-y-4 py-4">
                            {/* Your shift */}
                            <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Your Shift to Exchange</p>
                                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-4 flex items-center gap-3">
                                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex flex-col items-center justify-center">
                                        <span className="text-[10px] uppercase text-blue-600">{format(selectedShift.date, 'EEE')}</span>
                                        <span className="text-lg font-bold text-blue-700">{format(selectedShift.date, 'd')}</span>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-blue-900">{selectedShift.title}</p>
                                        <p className="text-xs text-blue-700">{format(selectedShift.date, 'MMM d')} • {selectedShift.startTime} - {selectedShift.endTime}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Note */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                    What are you looking for? <span className="text-slate-400 font-normal">(Optional)</span>
                                </label>
                                <Textarea
                                    value={exchangeNote}
                                    onChange={(e) => setExchangeNote(e.target.value)}
                                    placeholder="e.g. Looking for any evening shift, Will exchange for a weekday shift..."
                                    rows={2}
                                    className="resize-none"
                                />
                            </div>
                        </div>
                    )}

                    <DialogFooter className="gap-3 sm:gap-2">
                        <Button variant="outline" onClick={() => setIsExchangeModalOpen(false)}>Cancel</Button>
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={confirmExchangeRequest}>
                            <ClipboardCheck className="w-4 h-4 mr-2" />
                            Post to Exchange
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Marketplace Exchange Modal (offering your shift for someone else's) */}
            <Dialog open={isMarketplaceExchangeOpen} onOpenChange={(open) => { setIsMarketplaceExchangeOpen(open); if (!open) resetExchangeModal(); }}>
                <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Repeat className="w-5 h-5 text-blue-600" />
                            Propose Shift Exchange
                        </DialogTitle>
                        <DialogDescription>
                            Select one of your shifts to offer in exchange for {selectedMarketplaceShift?.ownerName}'s shift.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedMarketplaceShift && (
                        <div className="space-y-4 py-4">
                            {/* Their shift */}
                            <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                                    {selectedMarketplaceShift.ownerName}'s Shift (You'll Get)
                                </p>
                                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
                                    <div className="w-12 h-12 bg-emerald-100 rounded-lg flex flex-col items-center justify-center">
                                        <span className="text-[10px] uppercase text-emerald-600">{format(selectedMarketplaceShift.date, 'EEE')}</span>
                                        <span className="text-lg font-bold text-emerald-700">{format(selectedMarketplaceShift.date, 'd')}</span>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-emerald-900">{selectedMarketplaceShift.title}</p>
                                        <p className="text-xs text-emerald-700">{selectedMarketplaceShift.dateDisplay} • {selectedMarketplaceShift.startTime} - {selectedMarketplaceShift.endTime}</p>
                                    </div>
                                    <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                                </div>
                            </div>

                            {/* Arrow */}
                            <div className="flex justify-center">
                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                                    <ArrowLeftRight className="w-5 h-5 text-slate-400" />
                                </div>
                            </div>

                            {/* Select your shift to offer */}
                            <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                                    Your Shift to Offer (Select One)
                                </p>

                                {eligibleShiftsForExchange.length === 0 ? (
                                    <div className="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                        <p className="text-slate-500 text-sm">No eligible shifts to offer</p>
                                        <p className="text-xs text-slate-400">You need scheduled upcoming shifts</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                                        {eligibleShiftsForExchange.map((shift) => (
                                            <button
                                                key={shift.id}
                                                onClick={() => setShiftToOffer(shift)}
                                                className={`w-full text-left border rounded-xl p-3 flex items-center gap-3 transition-all ${shiftToOffer?.id === shift.id
                                                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                                                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                                    }`}
                                            >
                                                <div className={`w-10 h-10 rounded-lg flex flex-col items-center justify-center ${shiftToOffer?.id === shift.id ? 'bg-blue-100' : 'bg-slate-100'
                                                    }`}>
                                                    <span className="text-[9px] uppercase text-slate-500">{format(shift.date, 'EEE')}</span>
                                                    <span className="text-sm font-bold text-slate-700">{format(shift.date, 'd')}</span>
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium text-slate-800">{shift.title}</p>
                                                    <p className="text-xs text-slate-500">{format(shift.date, 'MMM d')} • {shift.startTime} - {shift.endTime}</p>
                                                </div>
                                                {shiftToOffer?.id === shift.id && <Check className="w-5 h-5 text-blue-600" />}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Summary */}
                            {shiftToOffer && (
                                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                                    <p className="text-xs font-semibold text-slate-600 mb-2">Exchange Summary</p>
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className="text-slate-700">{shiftToOffer.title}</span>
                                        <ArrowRight className="w-4 h-4 text-slate-400" />
                                        <span className="text-emerald-700 font-medium">{selectedMarketplaceShift.title}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <DialogFooter className="gap-3 sm:gap-2">
                        <Button variant="outline" onClick={() => setIsMarketplaceExchangeOpen(false)}>Cancel</Button>
                        <Button
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                            onClick={confirmMarketplaceExchange}
                            disabled={!shiftToOffer}
                        >
                            <Repeat className="w-4 h-4 mr-2" />
                            Send Exchange Request
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default MyShiftView;
