import { requireNoAuth } from "@/lib/auth/utils";
import { SignInView } from "@/modules/auth/ui/views/sign-in-view";

const Page = async () => {
  await requireNoAuth();

  return <SignInView />;
};

export default Page;
