import { DEMO_USER } from "../../constants/account";
import Field from "./Field";

export default function SettingsPanel() {
  return (
    <form className="max-w-xl space-y-5" onSubmit={(e) => e.preventDefault()}>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Full name" value={DEMO_USER.name} />
        <Field label="Phone" value={DEMO_USER.phone} />
      </div>
      <Field label="Email" value={DEMO_USER.email} type="email" />
      <Field label="New password" value="" type="password" />
      <div className="flex items-center gap-6 pt-2">
        <button
          type="submit"
          className="label rounded-full bg-softblack px-8 py-4 text-[11px] text-ivory transition-transform hover:scale-[1.03]"
        >
          Save changes
        </button>
        <button type="button" className="label text-[10.5px] text-warmgray hover:text-softblack">
          Sign out
        </button>
      </div>
    </form>
  );
}
