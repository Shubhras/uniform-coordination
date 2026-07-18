import NotificationDetails from "./NotificationDetails";

export default async function Page({ params }) {
  const { notificationId } = await params;

  return <NotificationDetails notificationId={notificationId} />;
}
