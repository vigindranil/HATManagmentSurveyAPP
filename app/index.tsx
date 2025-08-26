import { Redirect } from "expo-router";
import { useAuth } from "@/context/auth-context";

export default function IndexRedirect() {
  const { user, isAuthLoading } = useAuth();

  if (isAuthLoading) return null; // splash already covers loading

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  return <Redirect href="/(app)/index" />;
}
