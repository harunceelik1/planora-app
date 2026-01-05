// app/auth/new-verification/page.tsx

import { NewVerificationForm } from "@/features/components/auth/new-verification-form";

const NewVerificationPage = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <NewVerificationForm />
    </div>
  );
};

export default NewVerificationPage;
