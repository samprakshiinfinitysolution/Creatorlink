"use client";

import Link from "next/link";

const Hero = () => {
    return (
        <section className="relative overflow-hidden bg-[#FFF7F8] px-6 pb-20 pt-36 md:pt-44">
            
            {/* Background Glow */}
            <div
                className="
                    pointer-events-none absolute left-1/2 top-20
                    h-80 w-80 -translate-x-1/2
                    rounded-full bg-[#FF4F87]/10
                    blur-3xl
                "
            />

            <div className="relative mx-auto max-w-7xl">

                {/* Top Badge */}
                <div className="flex justify-center">
                    <div
                        className="
                            inline-flex items-center gap-2
                            rounded-full border border-[#FF4F87]/20
                            bg-[#FDECEF] px-4 py-1.5
                            text-xs font-semibold text-[#FF4F87]
                        "
                    >
                        <span className="h-2 w-2 animate-pulse rounded-full bg-[#FF4F87]" />

                        Where Creators Meet Brands
                    </div>
                </div>

                {/* Heading */}
                <div className="mx-auto mt-7 max-w-5xl text-center">
                    <h1
                        className="
                            font-serif text-5xl font-medium
                            leading-[1.08] tracking-tight
                            text-[#111111]
                            md:text-7xl
                            lg:text-8xl
                        "
                    >
                        Turn Your{" "}
                        <span className="italic text-[#FF4F87]">
                            Influence
                        </span>
                        {" "}Into Impact.
                    </h1>

                    <p
                        className="
                            mx-auto mt-6 max-w-2xl
                            text-base leading-relaxed
                            text-[#736B70]
                            md:text-lg
                        "
                    >
                        CreatorLink brings creators and brands together to
                        discover opportunities, collaborate on campaigns,
                        and build meaningful partnerships.
                    </p>
                </div>

                {/* CTA Buttons */}
                <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                    <Link
                        href="/creators"
                        className="
                            rounded-full bg-[#111111]
                            px-7 py-3.5
                            text-sm font-semibold text-white
                            shadow-xl
                            transition-all duration-300
                            hover:bg-[#FF4F87]
                            hover:shadow-[#FF4F87]/20
                        "
                    >
                        Find Creators
                        <span className="ml-2">→</span>
                    </Link>

                    <Link
                        href="/signup"
                        className="
                            rounded-full border border-black/10
                            bg-white px-7 py-3.5
                            text-sm font-semibold text-[#111111]
                            transition-all duration-300
                            hover:border-[#FF4F87]
                            hover:text-[#FF4F87]
                        "
                    >
                        Become a Creator
                    </Link>
                </div>

                {/* Hero Visual */}
                <div className="relative mx-auto mt-16 max-w-5xl">
                    
                    <div
                        className="
                            relative min-h-[330px]
                            rounded-[2rem]
                            border border-black/5
                            bg-white/60
                            p-6
                            shadow-[0_30px_80px_-30px_rgba(17,17,17,0.18)]
                            backdrop-blur-sm
                            md:min-h-[390px]
                        "
                    >
                        {/* Left Creator Card */}
                        <div
                            className="
                                absolute left-4 top-8
                                w-60 rounded-3xl
                                border border-black/5
                                bg-white p-5
                                text-left shadow-xl
                                md:left-12 md:top-12
                            "
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className="
                                        flex h-12 w-12 items-center
                                        justify-center rounded-full
                                        bg-[#FDECEF]
                                        text-lg font-semibold
                                        text-[#FF4F87]
                                    "
                                >
                                    C
                                </div>

                                <div>
                                    <p className="text-sm font-bold text-[#111111]">
                                        Creator
                                    </p>

                                    <p className="text-xs text-[#736B70]">
                                        Fashion • Lifestyle
                                    </p>
                                </div>
                            </div>

                            <div className="mt-5 border-t border-black/5 pt-4">
                                <div className="flex justify-between text-xs">
                                    <div>
                                        <span className="block text-[#736B70]">
                                            Followers
                                        </span>
                                        <strong>128K</strong>
                                    </div>

                                    <div>
                                        <span className="block text-[#736B70]">
                                            Engagement
                                        </span>
                                        <strong>4.8%</strong>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Center Connection */}
                        <div
                            className="
                                absolute left-1/2 top-1/2
                                hidden -translate-x-1/2
                                -translate-y-1/2
                                md:block
                            "
                        >
                            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#FF4F87] shadow-xl shadow-[#FF4F87]/20">
                                <span className="text-2xl text-white">
                                    ↔
                                </span>
                            </div>
                        </div>

                        {/* Right Campaign Card */}
                        <div
                            className="
                                absolute bottom-8 right-4
                                w-64 rounded-3xl
                                bg-[#111111] p-5
                                text-left text-white shadow-2xl
                                md:bottom-12 md:right-12
                            "
                        >
                            <span className="text-[10px] font-bold uppercase tracking-widest text-[#FF8FAE]">
                                Brand Campaign
                            </span>

                            <h3 className="mt-2 font-serif text-xl">
                                New Campaign
                            </h3>

                            <div className="mt-4 flex items-center justify-between text-xs">
                                <span className="text-white/60">
                                    Collaboration
                                </span>

                                <span className="font-semibold text-[#FF8FAE]">
                                    Open
                                </span>
                            </div>
                        </div>

                        {/* Bottom Label */}
                        <div
                            className="
                                absolute bottom-5 left-1/2
                                hidden -translate-x-1/2
                                rounded-full border border-black/5
                                bg-white px-5 py-2
                                text-xs font-semibold text-[#111111]
                                shadow-lg
                                md:block
                            "
                        >
                            Discover • Connect • Collaborate
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;