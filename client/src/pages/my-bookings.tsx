import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Train, Calendar, MapPin, Ticket, X } from "lucide-react";
import { format } from "date-fns";
import type { BookingWithDetails } from "@shared/schema";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function MyBookings() {
  const { toast } = useToast();

  const { data: bookings = [], isLoading } = useQuery<BookingWithDetails[]>({
    queryKey: ["/api/bookings"],
  });

  const cancelBooking = useMutation({
    mutationFn: async (bookingId: string) => {
      return await apiRequest("DELETE", `/api/bookings/${bookingId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      toast({
        title: "Booking Cancelled",
        description: "Your booking has been cancelled successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Cancellation Failed",
        description: error.message || "Unable to cancel booking.",
        variant: "destructive",
      });
    },
  });

  const upcomingBookings = bookings.filter(
    (b) => b.status === "confirmed" && new Date(b.travelDate) >= new Date()
  );
  const pastBookings = bookings.filter(
    (b) => b.status === "cancelled" || new Date(b.travelDate) < new Date()
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-6xl mx-auto px-6 md:px-12 lg:px-16">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">My Bookings</h1>
          <p className="text-muted-foreground">Manage your train reservations</p>
        </div>

        {upcomingBookings.length === 0 && pastBookings.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Train className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No bookings yet</h3>
              <p className="text-muted-foreground text-center mb-6">
                Start your journey by booking your first ticket
              </p>
              <Button asChild data-testid="button-book-first-ticket">
                <a href="/book">Book Your First Ticket</a>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {upcomingBookings.length > 0 && (
              <div>
                <h2 className="text-2xl font-semibold mb-4">Upcoming Journeys</h2>
                <div className="space-y-4">
                  {upcomingBookings.map((booking) => (
                    <Card key={booking.id}>
                      <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_auto] gap-6">
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-5 h-5 text-primary" />
                              <div>
                                <div className="font-semibold text-lg">
                                  {booking.route.fromStation} → {booking.route.toStation}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {booking.route.distanceKm} km
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-5 h-5 text-primary" />
                              <span className="font-medium">
                                {format(new Date(booking.travelDate), "EEEE, MMMM d, yyyy")}
                              </span>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div>
                              <div className="text-sm text-muted-foreground">Coach & Seat</div>
                              <div className="font-medium">
                                {booking.coach} - Row {booking.row}, Seat{" "}
                                {String.fromCharCode(64 + booking.column)}
                                {booking.row}
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-muted-foreground">PNR</div>
                              <div className="font-mono font-medium" data-testid={`pnr-${booking.pnr}`}>
                                {booking.pnr}
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-muted-foreground">Passenger</div>
                              <div className="font-medium">{booking.passengerName}</div>
                              <div className="text-sm text-muted-foreground">
                                Age: {booking.passengerAge}
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col justify-between items-end">
                            <div className="text-right">
                              <div className="text-sm text-muted-foreground mb-1">Total Fare</div>
                              <div className="text-2xl font-bold">₹{parseFloat(booking.fare).toFixed(2)}</div>
                              <Badge variant="secondary" className="mt-2">
                                Pay at Station
                              </Badge>
                            </div>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  data-testid={`button-cancel-${booking.id}`}
                                >
                                  <X className="w-4 h-4 mr-2" />
                                  Cancel
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Cancel Booking?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to cancel this booking? This action cannot be
                                    undone. Your seat will be released for other passengers.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Keep Booking</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => cancelBooking.mutate(booking.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    {cancelBooking.isPending ? (
                                      <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Cancelling...
                                      </>
                                    ) : (
                                      "Yes, Cancel Booking"
                                    )}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {pastBookings.length > 0 && (
              <div>
                <h2 className="text-2xl font-semibold mb-4">Past & Cancelled</h2>
                <div className="space-y-4">
                  {pastBookings.map((booking) => (
                    <Card key={booking.id} className="opacity-60">
                      <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_auto] gap-6">
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-5 h-5 text-muted-foreground" />
                              <div>
                                <div className="font-semibold">
                                  {booking.route.fromStation} → {booking.route.toStation}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {format(new Date(booking.travelDate), "MMMM d, yyyy")}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div>
                            <div className="text-sm text-muted-foreground">PNR</div>
                            <div className="font-mono font-medium">{booking.pnr}</div>
                          </div>

                          <div className="flex flex-col items-end">
                            <Badge variant={booking.status === "cancelled" ? "destructive" : "secondary"}>
                              {booking.status === "cancelled" ? "Cancelled" : "Completed"}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
