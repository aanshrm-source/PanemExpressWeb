import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Train, User, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface NavbarProps {
  user: { username: string; email: string } | null;
  onLogout: () => void;
}

export function Navbar({ user, onLogout }: NavbarProps) {
  const [location] = useLocation();

  return (
    <nav className="border-b bg-card">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link href="/" data-testid="link-home">
            <div className="flex items-center gap-3 hover-elevate active-elevate-2 px-4 py-2 rounded-lg cursor-pointer">
              <Train className="w-8 h-8 text-primary" />
              <div className="flex flex-col">
                <span className="text-xl font-bold text-foreground">Panem Express</span>
                <span className="text-xs text-muted-foreground">Rail Booking Portal</span>
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link href="/book">
                  <Button
                    variant={location === "/book" ? "default" : "ghost"}
                    data-testid="button-book-ticket"
                  >
                    Book Ticket
                  </Button>
                </Link>
                <Link href="/bookings">
                  <Button
                    variant={location === "/bookings" ? "default" : "ghost"}
                    data-testid="button-my-bookings"
                  >
                    My Bookings
                  </Button>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full" data-testid="button-user-menu">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {user.username.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-2 py-2">
                      <p className="text-sm font-medium" data-testid="text-username">{user.username}</p>
                      <p className="text-xs text-muted-foreground" data-testid="text-email">{user.email}</p>
                    </div>
                    <DropdownMenuItem onClick={onLogout} data-testid="button-logout">
                      <LogOut className="mr-2 w-4 h-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" data-testid="button-login">
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button data-testid="button-register">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
