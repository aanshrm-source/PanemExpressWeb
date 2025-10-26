import { cn } from "@/lib/utils";
import { ROWS, COLUMNS } from "@shared/schema";

interface SeatMapProps {
  bookedSeats: Set<string>;
  selectedSeat: { row: number; column: number } | null;
  onSeatSelect: (row: number, column: number) => void;
}

export function SeatMap({ bookedSeats, selectedSeat, onSeatSelect }: SeatMapProps) {
  const getSeatKey = (row: number, col: number) => `${row}-${col}`;
  const isBooked = (row: number, col: number) => bookedSeats.has(getSeatKey(row, col));
  const isSelected = (row: number, col: number) =>
    selectedSeat?.row === row && selectedSeat?.column === col;

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-4">
        <div className="text-sm font-medium text-muted-foreground">Front of Coach</div>
        
        <div className="grid gap-2">
          {Array.from({ length: ROWS }, (_, rowIndex) => (
            <div key={rowIndex} className="flex items-center gap-2">
              <div className="w-8 text-sm font-medium text-muted-foreground text-right">
                {rowIndex + 1}
              </div>
              <div className="flex gap-2 md:gap-4">
                {Array.from({ length: COLUMNS }, (_, colIndex) => {
                  const seatBooked = isBooked(rowIndex + 1, colIndex + 1);
                  const seatSelected = isSelected(rowIndex + 1, colIndex + 1);
                  
                  return (
                    <div key={colIndex} className={cn(colIndex === 2 && "ml-4 md:ml-8")}>
                      <button
                        type="button"
                        disabled={seatBooked}
                        onClick={() => onSeatSelect(rowIndex + 1, colIndex + 1)}
                        className={cn(
                          "w-10 h-10 md:w-12 md:h-12 rounded-lg border-2 flex items-center justify-center text-xs font-medium transition-all",
                          seatBooked && "opacity-30 cursor-not-allowed bg-muted border-border",
                          !seatBooked && !seatSelected && "border-border hover-elevate active-elevate-2 cursor-pointer",
                          seatSelected && "border-primary bg-primary/10 ring-2 ring-primary"
                        )}
                        data-testid={`seat-${rowIndex + 1}-${colIndex + 1}`}
                      >
                        {String.fromCharCode(65 + colIndex)}
                        {rowIndex + 1}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="text-sm font-medium text-muted-foreground">Aisle</div>
      </div>

      <div className="flex flex-wrap gap-6 justify-center pt-4 border-t">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg border-2 border-border bg-background"></div>
          <span className="text-sm">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg border-2 border-primary bg-primary/10 ring-2 ring-primary"></div>
          <span className="text-sm">Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg border-2 opacity-30 bg-muted"></div>
          <span className="text-sm">Booked</span>
        </div>
      </div>
    </div>
  );
}
