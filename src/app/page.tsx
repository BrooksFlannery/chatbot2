import Link from "next/link";
import { AppSidebar } from "~/components/app-sidebar";
import { Logout } from "~/components/logout";
import { SideBar } from "~/components/side-bar";

export default async function Home() {

  return (
    <>
      <AppSidebar />
    </>
  );
}
