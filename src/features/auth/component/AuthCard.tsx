import Image from "next/image";
import Link from "next/link";
import React from "react";

type AuthCardProps = {
  title: string;
  description: string;
  badge?: React.ReactNode;
  children: React.ReactNode;
};

const AuthCard = ({ title, description, badge, children }: AuthCardProps) => {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(245,156,71,0.18),_transparent_36%),linear-gradient(180deg,#fff9f3_0%,#ffffff_64%)] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-2xl overflow-hidden rounded-[28px] border border-[#f1dcc7] bg-white/95 shadow-[0_24px_80px_rgba(174,91,28,0.12)]">
        <div className="border-b border-[#f3e1cf] bg-[#fff8f1] px-6 py-8 sm:px-8 sm:py-9">
          <div className="flex items-center justify-center">
            <Link href="/">
              <Image
                src="/images/logo.png"
                alt="Hinkle"
                width={140}
                height={52}
                className="cursor-pointer transition-opacity hover:opacity-80"
              />
            </Link>
          </div>

          {badge ? (
            <div className="mt-6 flex items-center justify-center">{badge}</div>
          ) : null}

          <h1 className="mt-6 text-center text-3xl font-semibold tracking-tight text-[#8f451c] sm:text-[2rem]">
            {title}
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-center text-sm leading-6 text-[#735b4a] sm:text-[15px]">
            {description}
          </p>
        </div>

        <div className="px-6 py-8 sm:px-8 sm:py-9">{children}</div>
      </div>
    </div>
  );
};

export default AuthCard;
