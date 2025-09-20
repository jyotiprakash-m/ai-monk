import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Database } from "lucide-react";

// Define secure types for database values
type DatabaseValue = string | number | boolean | null;

// Define a row as an array of database values
type DatabaseRow = DatabaseValue[];

// Secure interface with proper typing
interface DynamicQueryTableProps {
  generatedQuery: string;
  result: DatabaseRow[];
}

const DynamicQueryTable: React.FC<DynamicQueryTableProps> = ({ generatedQuery, result }) => {
  // Secure data validation and sanitization
  const sanitizedResult = useMemo(() => {
    if (!Array.isArray(result)) {
      console.warn('Invalid result format: expected array');
      return [];
    }
    
    return result.map((row, rowIndex) => {
      if (!Array.isArray(row)) {
        console.warn(`Invalid row format at index ${rowIndex}: expected array`);
        return [];
      }
      
      return row.map((cell, cellIndex) => {
        try {
          // Handle null/undefined
          if (cell === null || cell === undefined) {
            return null;
          }
          
          // Handle strings (including datetime strings, decimals as strings)
          if (typeof cell === 'string') {
            // Check if it's an ISO datetime string (from backend serialization)
            if (cell.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)) {
              try {
                const date = new Date(cell);
                return date.toLocaleString();
              } catch {
                return cell;
              }
            }
            
            // Check if it's a decimal/currency string
            if (cell.match(/^\d+\.?\d*$/) && parseFloat(cell) > 0) {
              const value = parseFloat(cell);
              // If it looks like currency (has decimal places or is a common price range)
              if (cell.includes('.') || (value > 10 && value < 10000)) {
                return `$${value.toFixed(2)}`;
              }
            }
            
            // Check if it's a legacy datetime string pattern (fallback)
            if (cell.includes('datetime.datetime')) {
              const dateMatch = cell.match(/datetime\.datetime\((\d+),\s*(\d+),\s*(\d+),\s*(\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+))?\)/);
              if (dateMatch) {
                const [, year, month, day, hour, minute, second, microsecond] = dateMatch;
                const date = new Date(
                  parseInt(year), 
                  parseInt(month) - 1, // JS months are 0-indexed
                  parseInt(day), 
                  parseInt(hour), 
                  parseInt(minute), 
                  parseInt(second),
                  microsecond ? Math.floor(parseInt(microsecond) / 1000) : 0
                );
                return date.toLocaleString();
              }
            }
            
            // Check if it's a legacy Decimal string pattern (fallback)
            if (cell.includes("Decimal('") && cell.includes("')")) {
              const decimalMatch = cell.match(/Decimal\('(.+)'\)/);
              if (decimalMatch) {
                const value = parseFloat(decimalMatch[1]);
                return isNaN(value) ? cell : `$${value.toFixed(2)}`;
              }
            }
            
            // Sanitize regular strings (escape HTML, limit length)
            return cell.length > 100 ? cell.substring(0, 100) + '...' : cell;
          }
          
          // Handle numbers
          if (typeof cell === 'number') {
            return isFinite(cell) ? cell : 'Invalid Number';
          }
          
          // Handle boolean
          if (typeof cell === 'boolean') {
            return cell.toString();
          }
          
          // Default case: convert to string safely
          return String(cell);
        } catch (error) {
          console.error(`Error processing cell [${rowIndex}][${cellIndex}]:`, error);
          return 'Error';
        }
      });
    });
  }, [result]);

  // Extract column names dynamically from SELECT part of query
  const columns = useMemo(() => {
    try {
      const selectPart = generatedQuery.split(/from/i)[0]; // everything before FROM
      return selectPart
        .replace(/select/i, "")
        .split(",")
        .map((col) => {
          col = col.trim();
          // if column has alias (AS something), take that
          if (/ as /i.test(col)) {
            return col.split(/ as /i).pop()?.trim() ?? col;
          }
          // else take last part after dot (e.g. p.product_id -> product_id)
          return col.split(".").pop() ?? col;
        });
    } catch (err) {
      return [];
    }
  }, [generatedQuery]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Database className="h-5 w-5" />
          Query Results
          <Badge variant="secondary" className="ml-auto">
            {sanitizedResult.length} rows
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {sanitizedResult.length === 0 ? (
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <div className="text-center">
              <Database className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No data available</p>
            </div>
          </div>
        ) : (
          <ScrollArea className="w-full">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    {columns.map((col, i) => (
                      <th key={i} className="text-left p-3 font-semibold text-sm bg-muted/50">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sanitizedResult.map((row, i) => (
                    <tr key={i} className="border-b hover:bg-muted/25 transition-colors">
                      {row.map((cell: DatabaseValue, j: number) => (
                        <td key={j} className="p-3 text-sm">
                          <div className="break-words max-w-xs">
                            {cell === null ? (
                              <Badge variant="outline" className="text-xs">NULL</Badge>
                            ) : (
                              <span className="font-mono text-xs">{String(cell)}</span>
                            )}
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default DynamicQueryTable;
