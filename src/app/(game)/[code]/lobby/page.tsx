import { requireAuth } from "@/lib/auth/utils";
import { LobbyView } from "@/modules/lobby/ui/views/lobby-view";

const LobbyPage = async ({ params }: { params: Promise<{ code: string }> }) => {
  const { code } = await params;
  await requireAuth({
    returnUrl: `/${code}/lobby`,
  });

  return <LobbyView />;
};
export default LobbyPage;
