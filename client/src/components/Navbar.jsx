import { Menu, School } from "lucide-react";
import React, { useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import DarkMode from "@/DarkMode";

import { Separator } from "@radix-ui/react-dropdown-menu";
import { Link, useNavigate } from "react-router-dom";
import { useLogoutUserMutation } from "@/features/api/authApi";
import { toast } from "sonner";
import { useSelector } from "react-redux";

const Navbar = () => {
  const { user } = useSelector((store) => store.auth);
  const [logoutUser, { data, isSuccess }] = useLogoutUserMutation();
  // const [logoutUser] = useLogoutUserMutation();
  const navigate = useNavigate();

  const logoutHandler = async () => {
    await logoutUser().unwrap();
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success(data.message || "User Log Out");
      navigate("/login");
    }
  }, [isSuccess]);

  return (
    <div className="h-16 dark:bg-[#0a0a0a] bg-white border-b dark:border-b-gray-800 border-b-gray-200 fixed top-0 left-0 right-0 duration-300 z-10">
      {/* {Desktop} */}
      <div className="max-w-7xl mx-auto hidden md:flex justify-between items-center gap-10 h-full">
        <div className="flex items-center gap-2">
          <School size={"30"} />
          <Link to='/'>
          <h1 className="hidden md:block font-extrabold text-2xl">
            E-Learning
          </h1>
          </Link>
        </div>
        {/* User Icon and Dark mode icon */}
        <div className="flex items-center gap-5">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar>
                  <AvatarImage
                    src={user?.photoUrl || "https://github.com/shadcn.png"}
                    alt="@shadcn"
                  />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    <Link to="/mylearning">My Learning</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link to="/profile">Edit Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={logoutHandler}>
                    Log Out
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                {user?.role === "instructor" && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem><Link to='/admin/dashboard'>Dashboard</Link></DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => navigate("/login")}>
                Login
              </Button>
              <Button onClick={() => navigate("/login")}>Signup</Button>
            </div>
          )}
          <DarkMode />
        </div>
      </div>
      {/* Mobile */}
      <div className="md:hidden">
        <div className="flex items-center justify-between px-4 h-full mt-3">
          <h1 className="font-extrabold text-2xl">E-Learning</h1>
          <MobileNavbar user={user} logoutHandler={logoutHandler} />
        </div>
      </div>
    </div>
  );
};

export default Navbar;

const MobileNavbar = ({ logoutHandler,user }) => {
  const role = "instructor";
  const navigate = useNavigate();
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          size="icon"
          className="rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          variant="outline"
        >
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-[280px] bg-white dark:bg-[#0a0a0a] p-6"
      >
        <SheetHeader className="flex flex-row items-center justify-between">
          <SheetTitle className="text-2xl font-bold text-gray-900 dark:text-white">
            <Link to="/">
            <h1>E-Learning</h1>
            </Link>
          </SheetTitle>
          <DarkMode />
        </SheetHeader>
        <Separator className="my-4 border-t border-gray-200 dark:border-gray-700" />
        <nav className="flex flex-col space-y-3">
          <SheetClose asChild>
            <Link to={`/mylearning`}>
            <Button
              variant="ghost"
              className="justify-start text-lg font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
            >
              My Learning
            </Button>
            </Link>
          </SheetClose>
          <SheetClose asChild>
            <Link to={`/profile`}>
            <Button
              variant="ghost"
              className="justify-start text-lg font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
            >
              Edit Profile
            </Button>
            </Link>
          </SheetClose>
          <SheetClose asChild>
            <Button
              onClick={logoutHandler}
              variant="ghost"
              className="justify-start text-lg font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
            >
              Log Out
            </Button>
          </SheetClose>
        </nav>
        {user?.role === "instructor" && (
          <SheetFooter className="mt-6">
            <SheetClose asChild>
              <Button onClick={()=>navigate(`/admin/dashboard`)} className="w-full bg-black hover:bg-gray-800 text-white font-semibold rounded-md">
                Dashboard
              </Button>
            </SheetClose>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
};
