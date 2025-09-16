import { ChartAreaGradient } from "@/components/charts/ChartAreaGradient";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Home() {
  return (
    <main className="flex items-center justify-center min-h-screen p-6 bg-gray-50">
      <Card className="w-full max-w-5xl">
        <CardHeader>
          <CardTitle>Visitor Counter</CardTitle>
          <CardDescription>
            status of logged / not / failed to log
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartAreaGradient />
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <div className="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-1 items-center">
            <span className="font-medium text-muted-foreground text-right">
              IP Address:
            </span>
            <span className="break-all">::ffff:192.168.157.157</span>

            <span className="font-medium text-muted-foreground text-right">
              Last Visited:
            </span>
            <span>
              {new Date("2025-09-15T10:03:33.433+00:00").toLocaleString()}
            </span>

            <span className="font-medium text-muted-foreground text-right">
              User Agent:
            </span>
            <span className="break-all">curl/8.7.1</span>
          </div>
        </CardFooter>
      </Card>
    </main>
  );
}
