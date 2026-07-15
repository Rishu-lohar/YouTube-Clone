import {
  Clock,
  Compass,
  History,
  Home,
  PlaySquare,
  ThumbsUp,
  User,
} from "lucide-react";

import Link from "next/link";
import { Button } from "@/components/ui/button";

const Sidebar = () => {
  return (
    <aside className="w-64 min-h-screen bg-white border-r p-2">
      
      <nav className="space-y-1">

        {/* Main Navigation */}
        <Link href="/">
          <Button variant="ghost" className="w-full justify-start">
            <Home className="w-5 h-5 mr-3" />
            Home
          </Button>
        </Link>

        <Link href="/explore">
          <Button variant="ghost" className="w-full justify-start">
            <Compass className="w-5 h-5 mr-3" />
            Explore
          </Button>
        </Link>

        <Link href="/subscriptions">
          <Button variant="ghost" className="w-full justify-start">
            <PlaySquare className="w-5 h-5 mr-3" />
            Subscriptions
          </Button>
        </Link>

        {/* User Navigation */}
        <div className="border-t pt-2 mt-2">
          <Link href="/history">
            <Button variant="ghost" className="w-full justify-start">
              <History className="w-5 h-5 mr-3" />
              History
            </Button>
          </Link>

          <Link href="/liked">
            <Button variant="ghost" className="w-full justify-start">
              <ThumbsUp className="w-5 h-5 mr-3" />
              Liked videos
            </Button>
          </Link>

          <Link href="/watch-later">
            <Button variant="ghost" className="w-full justify-start">
              <Clock className="w-5 h-5 mr-3" />
              Watch later
            </Button>
          </Link>

          <Link href="/channel">
            <Button variant="ghost" className="w-full justify-start">
              <User className="w-5 h-5 mr-3" />
              Your channel
            </Button>
          </Link>
        </div>

      </nav>
    </aside>
  );
};

export default Sidebar;