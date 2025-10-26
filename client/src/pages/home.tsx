import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Train, MapPin, Calendar, CreditCard, Shield, Clock } from "lucide-react";

interface HomeProps {
  user: { username: string; email: string } | null;
}

export default function Home({ user }: HomeProps) {
  return (
    <div className="min-h-screen bg-background">
      <div
        className="relative h-[500px] md:h-[600px] bg-gradient-to-br from-primary/90 to-primary flex items-center justify-center"
        style={{
          backgroundImage: "linear-gradient(rgba(37, 99, 235, 0.9), rgba(29, 78, 216, 0.95)), url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23ffffff\" fill-opacity=\"0.05\"%3E%3Cpath d=\"M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')",
        }}
      >
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Journey Across Panem
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8">
            Book your train tickets with ease. Pay at the station, travel with confidence.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            {user ? (
              <Link href="/book">
                <Button size="lg" variant="outline" className="bg-white/10 border-white/30 text-white backdrop-blur-sm hover:bg-white/20" data-testid="button-book-now-hero">
                  Book Ticket Now
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/register">
                  <Button size="lg" variant="outline" className="bg-white/10 border-white/30 text-white backdrop-blur-sm hover:bg-white/20" data-testid="button-get-started">
                    Get Started
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline" className="bg-white/10 border-white/30 text-white backdrop-blur-sm hover:bg-white/20" data-testid="button-login-hero">
                    Login
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-lg text-muted-foreground">Simple, secure, and convenient booking in just a few steps</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card>
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <MapPin className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Select Route & Date</h3>
              <p className="text-muted-foreground">
                Choose your departure and destination from our network of routes across Panem
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Train className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Choose Your Seat</h3>
              <p className="text-muted-foreground">
                Select from 5 coach classes and pick your preferred seat from our interactive seat map
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <CreditCard className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Pay at Station</h3>
              <p className="text-muted-foreground">
                Get your PNR instantly. No online payment needed - pay when you arrive at the station
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="bg-card rounded-lg p-8 mb-16">
          <h2 className="text-2xl font-bold mb-6">Why Choose Panem Express?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex gap-4">
              <Shield className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold mb-1">Secure Booking</h3>
                <p className="text-sm text-muted-foreground">
                  Your reservations are safely stored and can be managed anytime from your dashboard
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <Clock className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold mb-1">Instant Confirmation</h3>
                <p className="text-sm text-muted-foreground">
                  Receive email confirmation with your PNR immediately after booking
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <Calendar className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold mb-1">Easy Cancellation</h3>
                <p className="text-sm text-muted-foreground">
                  Cancel your booking anytime before travel date with just one click
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <Train className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold mb-1">Senior Discounts</h3>
                <p className="text-sm text-muted-foreground">
                  Passengers aged 60 and above receive an automatic 20% discount on all fares
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="bg-card border-t py-12">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-semibold mb-4">About Panem Express</h3>
              <p className="text-sm text-muted-foreground">
                Connecting districts across Panem with reliable, efficient rail service since the beginning.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <div className="space-y-2 text-sm">
                <Link href="/book"><span className="text-muted-foreground hover:text-foreground cursor-pointer">Book Ticket</span></Link>
                <br />
                <Link href="/bookings"><span className="text-muted-foreground hover:text-foreground cursor-pointer">My Bookings</span></Link>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Contact & Support</h3>
              <p className="text-sm text-muted-foreground">
                24/7 Support Available<br />
                Secure Booking System
              </p>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            © 2025 Panem Express. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
