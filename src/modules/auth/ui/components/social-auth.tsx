import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { FcGoogle } from "react-icons/fc";

type Props = {
	pending: boolean;
	setPending: (pending: boolean) => void;
	setError: (error: string | null) => void;
};

export const SocialAuth = ({ pending, setPending, setError }: Props) => {
	const onSocial = (provider: "github" | "google") => {
		setError(null);
		setPending(true);

		authClient.signIn.social(
			{
				provider,
				callbackURL: "/",
			},
			{
				onSuccess: () => {
					setPending(false);
				},
				onError: ({ error }) => {
					setPending(false);
					setError(error.message);
				},
			}
		);
	};

	return (
		<div>
			<Button
				type="button"
				variant="outline"
				className="w-full"
				disabled={pending}
				onClick={() => onSocial("google")}
			>
				<FcGoogle />
				Continue with Google
			</Button>
		</div>
	);
};
