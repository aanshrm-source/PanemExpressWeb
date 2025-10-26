import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { SeatMap } from "@/components/booking/seat-map";
import { insertBookingSchema, COACH_CLASSES, COACH_ORDER, type Route } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Calendar as CalendarIcon, Loader2, ArrowRight, Train, Info } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { z } from "zod";

const bookingFormSchema = insertBookingSchema.extend({
  routeId: z.string().min(1, "Please select a route"),
  coach: z.string().min(1, "Please select a coach class"),
});

type BookingFormData = z.infer<typeof bookingFormSchema>;

export default function BookTicket() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedCoach, setSelectedCoach] = useState<string>("");
  const [selectedSeat, setSelectedSeat] = useState<{ row: number; column: number } | null>(null);

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      routeId: "",
      travelDate: "",
      coach: "",
      row: 0,
      column: 0,
      passengerName: "",
      passengerAge: 0,
    },
  });

  const { data: routes = [], isLoading: loadingRoutes } = useQuery<Route[]>({
    queryKey: ["/api/routes"],
  });

  const { data: bookedSeats = [] } = useQuery<{ row: number; column: number }[]>({
    queryKey: ["/api/bookings/seats", selectedRoute?.id, selectedDate ? format(selectedDate, "yyyy-MM-dd") : "", selectedCoach],
    enabled: !!selectedRoute && !!selectedDate && !!selectedCoach,
  });

  const createBooking = useMutation({
    mutationFn: async (data: BookingFormData) => {
      const response = await apiRequest("POST", "/api/bookings", data);
      return await response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      toast({
        title: "Booking Confirmed!",
        description: `Your PNR is ${data.pnr}. Check your email for details.`,
      });
      setLocation(`/confirmation/${data.pnr}`);
    },
    onError: (error: any) => {
      console.error("Booking error:", error);
      toast({
        title: "Booking Failed",
        description: error.message || "Unable to complete booking. Please try again.",
        variant: "destructive",
      });
    },
  });

  const bookedSeatsSet = useMemo(() => {
    return new Set(bookedSeats.map((s) => `${s.row}-${s.column}`));
  }, [bookedSeats]);

  const calculateFare = () => {
    if (!selectedRoute || !selectedCoach) return 0;
    const coachKey = selectedCoach as keyof typeof COACH_CLASSES;
    const ratePerKm = COACH_CLASSES[coachKey].ratePerKm;
    const baseFare = selectedRoute.distanceKm * ratePerKm;
    const age = form.watch("passengerAge");
    const discount = age >= 60 ? 0.2 : 0;
    return baseFare * (1 - discount);
  };

  const fare = calculateFare();
  const age = form.watch("passengerAge");
  const isSenior = age >= 60;

  const handleRouteSelect = (route: Route) => {
    setSelectedRoute(route);
    form.setValue("routeId", route.id);
    setStep(2);
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      form.setValue("travelDate", format(date, "yyyy-MM-dd"));
      setStep(3);
    }
  };

  const handleCoachSelect = (coachKey: string) => {
    setSelectedCoach(coachKey);
    form.setValue("coach", coachKey);
    setSelectedSeat(null);
    setStep(4);
  };

  const handleSeatSelect = (row: number, column: number) => {
    setSelectedSeat({ row, column });
    form.setValue("row", row);
    form.setValue("column", column);
    setStep(5);
  };

  const onSubmit = async (data: BookingFormData) => {
    console.log("Form data:", data);
    console.log("Form errors:", form.formState.errors);
    createBooking.mutate(data);
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Book Your Ticket</h1>
          <p className="text-muted-foreground">Follow the steps to complete your booking</p>
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          {["Route", "Date", "Coach", "Seat", "Details"].map((stepName, index) => (
            <div
              key={stepName}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg",
                step > index + 1 && "bg-primary text-primary-foreground",
                step === index + 1 && "bg-primary/10 border-2 border-primary",
                step < index + 1 && "bg-muted text-muted-foreground"
              )}
            >
              <div className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                step > index + 1 && "bg-primary-foreground text-primary",
                step === index + 1 && "bg-primary text-primary-foreground",
                step < index + 1 && "bg-muted-foreground/20 text-muted-foreground"
              )}>
                {step > index + 1 ? "✓" : index + 1}
              </div>
              <span className="text-sm font-medium hidden sm:inline">{stepName}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {step >= 1 && (
              <Card>
                <CardHeader>
                  <CardTitle>Select Route</CardTitle>
                  <CardDescription>Choose your journey from available routes</CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingRoutes ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {routes.map((route) => (
                        <button
                          key={route.id}
                          onClick={() => handleRouteSelect(route)}
                          className={cn(
                            "w-full p-4 rounded-lg border-2 transition-all hover-elevate active-elevate-2",
                            selectedRoute?.id === route.id
                              ? "border-primary bg-primary/5"
                              : "border-border"
                          )}
                          data-testid={`route-${route.id}`}
                        >
                          <div className="grid grid-cols-[1fr_auto_1fr_auto] items-center gap-4">
                            <div className="text-left">
                              <div className="font-semibold text-lg">{route.fromStation}</div>
                            </div>
                            <ArrowRight className="w-5 h-5 text-primary" />
                            <div className="text-right">
                              <div className="font-semibold text-lg">{route.toStation}</div>
                            </div>
                            <Badge variant="secondary">{route.distanceKm} km</Badge>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {step >= 2 && selectedRoute && (
              <Card>
                <CardHeader>
                  <CardTitle>Select Travel Date</CardTitle>
                  <CardDescription>Choose when you want to travel</CardDescription>
                </CardHeader>
                <CardContent>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full h-12 justify-start text-left font-normal",
                          !selectedDate && "text-muted-foreground"
                        )}
                        data-testid="button-select-date"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={handleDateSelect}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </CardContent>
              </Card>
            )}

            {step >= 3 && selectedDate && (
              <Card>
                <CardHeader>
                  <CardTitle>Select Coach Class</CardTitle>
                  <CardDescription>Choose your preferred travel class</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
                    {COACH_ORDER.map((coachKey) => {
                      const coach = COACH_CLASSES[coachKey];
                      return (
                        <button
                          key={coachKey}
                          onClick={() => handleCoachSelect(coachKey)}
                          className={cn(
                            "p-4 rounded-lg border-2 transition-all hover-elevate active-elevate-2",
                            selectedCoach === coachKey
                              ? "border-primary bg-primary/5"
                              : "border-border"
                          )}
                          data-testid={`coach-${coachKey}`}
                        >
                          <div className="text-sm font-semibold mb-1">{coach.name}</div>
                          <div className="text-xs text-muted-foreground">₹{coach.ratePerKm}/km</div>
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {step >= 4 && selectedCoach && (
              <Card>
                <CardHeader>
                  <CardTitle>Select Your Seat</CardTitle>
                  <CardDescription>Choose from available seats (5 rows × 4 seats)</CardDescription>
                </CardHeader>
                <CardContent>
                  <SeatMap
                    bookedSeats={bookedSeatsSet}
                    selectedSeat={selectedSeat}
                    onSeatSelect={handleSeatSelect}
                  />
                </CardContent>
              </Card>
            )}

            {step >= 5 && selectedSeat && (
              <Card>
                <CardHeader>
                  <CardTitle>Passenger Details</CardTitle>
                  <CardDescription>Enter passenger information</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="passengerName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Passenger Name</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter full name"
                                {...field}
                                data-testid="input-passenger-name"
                                className="h-12"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="passengerAge"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Passenger Age</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="Enter age"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                data-testid="input-passenger-age"
                                className="h-12"
                              />
                            </FormControl>
                            <FormMessage />
                            {isSenior && (
                              <div className="flex items-center gap-2 mt-2">
                                <Badge className="bg-green-500 text-white">
                                  Senior Discount: 20% Off
                                </Badge>
                              </div>
                            )}
                            {age > 0 && age < 7 && (
                              <p className="text-sm text-destructive mt-2">
                                Passengers under 7 cannot book alone
                              </p>
                            )}
                          </FormItem>
                        )}
                      />

                      <div className="pt-4 border-t">
                        <Button
                          type="submit"
                          className="w-full h-12"
                          disabled={createBooking.isPending}
                          data-testid="button-confirm-booking"
                          onClick={() => {
                            console.log("Button clicked!");
                            console.log("Form state:", form.getValues());
                            console.log("Form errors:", form.formState.errors);
                          }}
                        >
                          {createBooking.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Confirming Booking...
                            </>
                          ) : (
                            `Confirm Booking - ₹${fare.toFixed(2)}`
                          )}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="lg:sticky lg:top-24 h-fit">
            <Card>
              <CardHeader>
                <CardTitle>Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedRoute && (
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Route</div>
                    <div className="font-medium">{selectedRoute.fromStation} → {selectedRoute.toStation}</div>
                    <div className="text-sm text-muted-foreground">{selectedRoute.distanceKm} km</div>
                  </div>
                )}

                {selectedDate && (
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Travel Date</div>
                    <div className="font-medium">{format(selectedDate, "PPP")}</div>
                  </div>
                )}

                {selectedCoach && (
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Coach Class</div>
                    <div className="font-medium">{COACH_CLASSES[selectedCoach as keyof typeof COACH_CLASSES].name}</div>
                  </div>
                )}

                {selectedSeat && (
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Seat</div>
                    <div className="font-medium">
                      Row {selectedSeat.row}, Seat {String.fromCharCode(64 + selectedSeat.column)}{selectedSeat.row}
                    </div>
                  </div>
                )}

                {selectedRoute && selectedCoach && (
                  <div className="pt-4 border-t space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Base Fare</span>
                      <span>₹{(selectedRoute.distanceKm * COACH_CLASSES[selectedCoach as keyof typeof COACH_CLASSES].ratePerKm).toFixed(2)}</span>
                    </div>
                    {isSenior && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Senior Discount (20%)</span>
                        <span>-₹{(selectedRoute.distanceKm * COACH_CLASSES[selectedCoach as keyof typeof COACH_CLASSES].ratePerKm * 0.2).toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-2xl font-bold pt-2 border-t">
                      <span>Total</span>
                      <span>₹{fare.toFixed(2)}</span>
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t">
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
                    <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <div className="font-medium text-primary mb-1">Pay at Station</div>
                      <p className="text-muted-foreground">
                        Present your PNR at the station counter for payment before boarding.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
