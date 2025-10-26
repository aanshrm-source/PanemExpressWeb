import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, Calendar, MapPin, Train, Ticket, Mail } from "lucide-react";
import { format } from "date-fns";
import type { BookingWithDetails } from "@shared/schema";

export default function Confirmation() {
  const [, params] = useRoute("/confirmation/:pnr");
  const pnr = params?.pnr;

  const { data: booking, isLoading } = useQuery<BookingWithDetails>({
    queryKey: ["/api/bookings/pnr", pnr],
    enabled: !!pnr,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Ticket className="w-8 h-8 text-destructive" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Booking Not Found</h2>
            <p className="text-muted-foreground mb-6">
              We couldn't find a booking with this PNR.
            </p>
            <Button asChild>
              <Link href="/book">Book a Ticket</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-3xl mx-auto px-6 md:px-12">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-12 h-12 text-green-500" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Booking Confirmed!</h1>
          <p className="text-muted-foreground text-lg">
            Your ticket has been reserved successfully
          </p>
        </div>

        <Card className="mb-6">
          <CardContent className="p-8">
            <div className="text-center mb-8 pb-8 border-b">
              <div className="text-sm text-muted-foreground mb-2">Your PNR</div>
              <div className="text-4xl font-mono font-bold text-primary" data-testid="text-pnr">
                {booking.pnr}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Save this PNR for future reference
              </p>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin className="w-5 h-5 text-primary" />
                    <span className="text-sm font-medium text-muted-foreground">Route</span>
                  </div>
                  <div className="font-semibold text-lg">
                    {booking.route.fromStation} → {booking.route.toStation}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {booking.route.distanceKm} km
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="w-5 h-5 text-primary" />
                    <span className="text-sm font-medium text-muted-foreground">Travel Date</span>
                  </div>
                  <div className="font-semibold text-lg">
                    {format(new Date(booking.travelDate), "EEEE")}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {format(new Date(booking.travelDate), "MMMM d, yyyy")}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Train className="w-5 h-5 text-primary" />
                    <span className="text-sm font-medium text-muted-foreground">Coach & Seat</span>
                  </div>
                  <div className="font-semibold">Coach: {booking.coach}</div>
                  <div className="text-sm text-muted-foreground">
                    Row {booking.row}, Seat {String.fromCharCode(64 + booking.column)}
                    {booking.row}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Ticket className="w-5 h-5 text-primary" />
                    <span className="text-sm font-medium text-muted-foreground">Passenger</span>
                  </div>
                  <div className="font-semibold">{booking.passengerName}</div>
                  <div className="text-sm text-muted-foreground">
                    Age: {booking.passengerAge}
                    {booking.passengerAge >= 60 && " (Senior - 20% off)"}
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-muted-foreground">Total Fare</span>
                  <span className="text-3xl font-bold">₹{parseFloat(booking.fare).toFixed(2)}</span>
                </div>
                <div className="flex justify-end">
                  <Badge variant="secondary" className="text-sm">
                    Pay at Station
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6 bg-primary/5 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Email Confirmation Sent</h3>
                <p className="text-sm text-muted-foreground">
                  A confirmation email with your booking details has been sent to{" "}
                  <span className="font-medium text-foreground">{booking.user.email}</span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Important Instructions</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex gap-2">
                <span className="text-primary">•</span>
                <span>
                  <strong>Payment:</strong> Please present this PNR at the station counter before
                  boarding. Payment can be made at the station.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">•</span>
                <span>
                  <strong>Boarding:</strong> Arrive at the station at least 30 minutes before
                  departure.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">•</span>
                <span>
                  <strong>Cancellation:</strong> You can cancel this booking from your "My Bookings"
                  page before the travel date.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">•</span>
                <span>
                  <strong>ID Proof:</strong> Carry a valid government-issued ID for verification.
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <div className="flex flex-wrap gap-4 justify-center">
          <Button asChild variant="outline" data-testid="button-view-bookings">
            <Link href="/bookings">View All Bookings</Link>
          </Button>
          <Button asChild data-testid="button-book-another">
            <Link href="/book">Book Another Ticket</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
