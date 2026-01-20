interface WelcomeSectionProps {
  userName: string;
}

export function WelcomeSection({ userName }: WelcomeSectionProps) {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-50">
        Good Evening, {userName}
      </h1>
      <p className="text-neutral-600 dark:text-neutral-400 mt-1">
        Here&apos;s what&apos;s happening with your recruitment pipeline today.
      </p>
    </div>
  );
}
