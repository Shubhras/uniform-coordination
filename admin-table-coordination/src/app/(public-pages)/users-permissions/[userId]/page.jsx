import UserDetails from "./UserDetails";

export default async function Page({ params }) {
  const { userId } = await params;

  return <UserDetails userId={userId} />;
}
