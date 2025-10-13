import { SafeUser } from "@/app/types";

import Categories from "./Categories";
import Container from "../Container";
import Logo from "./Logo";
import Search from "./Search";
import UserMenu from "./UserMenu";

interface NavbarProps {
  currentUser?: SafeUser | null;
}

const Navbar: React.FC<NavbarProps> = ({
  currentUser,
}) => {
  return (
    <div className="fixed w-full z-50 bg-white/95 backdrop-blur-md border-b border-gray-200/50 shadow-lg">
      {/* Main navbar */}
      <div className="relative">
        <Container>
          <div
            className="
              flex
              flex-row
              items-center
              justify-between
              gap-4 md:gap-6
              py-4
            "
          >
            {/* Left section - Logo and Search */}
            <div className="flex items-center gap-4 md:gap-8">
              <Logo />
              <div className="hidden lg:flex flex-1 max-w-md">
                <Search />
              </div>
            </div>

            {/* Right section - Search (mobile) and User Menu */}
            <div className="flex items-center gap-3 md:gap-4">
              <div className="lg:hidden">
                <Search />
              </div>
              <UserMenu currentUser={currentUser} />
            </div>
          </div>
        </Container>

        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none" />
      </div>

      {/* Categories section */}
      <div className="border-t border-gray-100/50">
        <Categories />
      </div>
    </div>
  );
}


export default Navbar;