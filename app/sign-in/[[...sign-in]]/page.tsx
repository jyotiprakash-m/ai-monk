import { SignIn } from '@clerk/nextjs'

export default function Page() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md">
        <SignIn 
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "shadow-none border-0 bg-white rounded-lg p-8",
              headerTitle: "text-2xl font-semibold text-gray-900 text-center mb-6",
              headerSubtitle: "text-gray-600 text-center mb-8",
              socialButtonsBlockButton: "border border-gray-300 hover:bg-gray-50 text-gray-700",
              formButtonPrimary: "bg-black hover:bg-gray-800 text-white font-medium py-3 px-4 rounded-md",
              formFieldInput: "border border-gray-300 rounded-md px-3 py-2 focus:ring-1 focus:ring-black focus:border-black",
              formFieldLabel: "text-gray-700 font-medium mb-2",
              identityPreviewEditButton: "text-black hover:text-gray-700",
              formResendCodeLink: "text-black hover:text-gray-700",
              otpCodeFieldInput: "border border-gray-300 rounded-md text-center focus:ring-1 focus:ring-black focus:border-black"
            },
            layout: {
              socialButtonsPlacement: "top"
            }
          }}
        />
      </div>
    </div>
  )
}