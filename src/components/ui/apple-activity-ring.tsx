"use client";

/**
 * @author: @kokonutui
 * @description: Apple Activity Card
 * @version: 1.0.0
 * @date: 2025-06-26
 * @license: MIT
 * @website: https://kokonutui.com
 * @github: https://github.com/kokonut-labs/kokonutui
 */

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { UserBalance } from "@/types/sessionTypes";

interface ActivityData {
    label: string;
    value: number;
    color: string;
    size: number;
    current: number;
    target: number;
    unit: string;
}

interface CircleProgressProps {
    data: ActivityData;
    index: number;
}

interface AppleActivityCardProps {
    balance: UserBalance;
    title?: string;
    className?: string;
}

const CircleProgress = ({ data, index }: CircleProgressProps) => {
    const strokeWidth = 16;
    const radius = (data.size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const progress = ((100 - data.value) / 100) * circumference;

    const gradientId = `gradient-${data.label.toLowerCase()}`;
    const gradientUrl = `url(#${gradientId})`;

    return (
        <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: index * 0.2, ease: "easeOut" }}
        >
            <div className="relative">
                <svg
                    width={data.size}
                    height={data.size}
                    viewBox={`0 0 ${data.size} ${data.size}`}
                    className="transform -rotate-90"
                    aria-label={`${data.label} Activity Progress - ${data.value}%`}
                >
                    <title>{`${data.label} Activity Progress - ${data.value}%`}</title>

                    <defs>
                        <linearGradient
                            id={gradientId}
                            x1="0%"
                            y1="0%"
                            x2="100%"
                            y2="100%"
                        >
                            <stop
                                offset="0%"
                                style={{
                                    stopColor: data.color,
                                    stopOpacity: 1,
                                }}
                            />
                            <stop
                                offset="100%"
                                style={{
                                    stopColor:
                                        data.color === "#3B82F6"
                                            ? "#60A5FA"
                                            : data.color === "#10B981"
                                            ? "#34D399"
                                            : "#4DDFED",
                                    stopOpacity: 1,
                                }}
                            />
                        </linearGradient>
                    </defs>

                    <circle
                        cx={data.size / 2}
                        cy={data.size / 2}
                        r={radius}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={strokeWidth}
                        className="text-zinc-200/50 dark:text-zinc-800/50"
                    />

                    <motion.circle
                        cx={data.size / 2}
                        cy={data.size / 2}
                        r={radius}
                        fill="none"
                        stroke={gradientUrl}
                        strokeWidth={strokeWidth}
                        strokeDasharray={circumference}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset: progress }}
                        transition={{
                            duration: 1.8,
                            delay: index * 0.2,
                            ease: "easeInOut",
                        }}
                        strokeLinecap="round"
                        style={{
                            filter: "drop-shadow(0 0 6px rgba(0,0,0,0.15))",
                        }}
                    />
                </svg>
            </div>
        </motion.div>
    );
};

const DetailedActivityInfo = ({ activities }: { activities: ActivityData[] }) => {
    return (
        <motion.div
            className="flex flex-col gap-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
        >
            {activities.map((activity) => (
                <motion.div key={activity.label} className="flex flex-col">
                    <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                        {activity.label}
                    </span>
                    <span
                        className="text-2xl font-bold"
                        style={{ color: activity.color }}
                    >
                        {activity.current}/{activity.target}
                        <span className="text-base ml-1 text-zinc-600 dark:text-zinc-400">
                            {activity.unit}
                        </span>
                    </span>
                    <span className="text-xs text-zinc-500 mt-1">
                        {activity.value.toFixed(0)}% utilizado
                    </span>
                </motion.div>
            ))}
        </motion.div>
    );
};

export function AppleActivityCard({
    balance,
    title = "Suas Quotas de Sessões",
    className,
}: AppleActivityCardProps) {
    const companyUsagePercent = (balance.usedCompany / balance.companyQuota) * 100;
    const personalUsagePercent = (balance.usedPersonal / balance.personalQuota) * 100;

    const activities: ActivityData[] = [
        {
            label: "EMPRESA",
            value: companyUsagePercent,
            color: "#3B82F6",
            size: 200,
            current: balance.usedCompany,
            target: balance.companyQuota,
            unit: "SESSÕES",
        },
        {
            label: "PESSOAL",
            value: personalUsagePercent,
            color: "#10B981",
            size: 160,
            current: balance.usedPersonal,
            target: balance.personalQuota,
            unit: "SESSÕES",
        },
    ];

    return (
        <div
            className={cn(
                "relative w-full p-6 rounded-xl border border-gray-200 shadow-sm overflow-hidden",
                "text-zinc-900 dark:text-white",
                className
            )}
        >
            {/* Blue to indigo gradient background */}
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{
                    backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 1600 400\'%3E%3Cdefs%3E%3ClinearGradient id=\'blueIndigoGrad\' x1=\'0%25\' y1=\'0%25\' x2=\'0%25\' y2=\'100%25\'%3E%3Cstop offset=\'0%25\' style=\'stop-color:%23E0F2FE;stop-opacity:1\' /%3E%3Cstop offset=\'25%25\' style=\'stop-color:%23BAE6FD;stop-opacity:1\' /%3E%3Cstop offset=\'50%25\' style=\'stop-color:%237DD3FC;stop-opacity:1\' /%3E%3Cstop offset=\'75%25\' style=\'stop-color:%2338BDF8;stop-opacity:1\' /%3E%3Cstop offset=\'100%25\' style=\'stop-color:%234F46E5;stop-opacity:1\' /%3E%3C/linearGradient%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3CfeColorMatrix type=\'saturate\' values=\'0\'/%3E%3C/filter%3E%3C/defs%3E%3Crect width=\'1600\' height=\'400\' fill=\'url(%23blueIndigoGrad)\'/%3E%3Crect width=\'1600\' height=\'400\' fill=\'url(%23blueIndigoGrad)\' filter=\'url(%23noise)\' opacity=\'0.1\'/%3E%3C/svg%3E")'
                }}
            ></div>
            <div className="relative z-10 flex flex-col gap-6">
                <motion.h2
                    className="text-xl font-semibold text-zinc-900 dark:text-white text-center"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    {title}
                </motion.h2>

                <div className="flex items-start gap-6">
                    <div className="relative w-[200px] h-[200px]">
                        {activities.map((activity, index) => (
                            <CircleProgress
                                key={activity.label}
                                data={activity}
                                index={index}
                            />
                        ))}
                    </div>
                    
                    <div className="flex-1 flex flex-col gap-6">
                        {/* Detailed Activity Info and Quota Cards side by side */}
                        <div className="flex gap-4">
                            {/* Detailed Activity Info - Compact */}
                            <div className="flex-shrink-0">
                                <DetailedActivityInfo activities={activities} />
                            </div>
                            
                            {/* Information Section - Compact cards with big text */}
                            <motion.div
                                className="space-y-2 flex-1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: 0.6 }}
                            >
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
                                    <h3 className="text-lg font-bold text-blue-900 mb-1">
                                        Quota da Empresa
                                    </h3>
                                    <p className="text-sm text-blue-800">
                                        Sessões financiadas pela sua empresa. Apenas sessões concluídas são deduzidas da quota.
                                    </p>
                                </div>
                                
                                <div className="bg-green-50 border border-green-200 rounded-lg p-2">
                                    <h3 className="text-lg font-bold text-green-900 mb-1">
                                        Quota Pessoal
                                    </h3>
                                    <p className="text-sm text-green-800">
                                        Sessões pagas pessoalmente. Ativada quando a quota da empresa se esgota ou para sessões adicionais.
                                    </p>
                                </div>

                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-2">
                                    <p className="text-sm text-gray-700 text-center">
                                        <strong>Política:</strong> Cancelamentos, faltas e reagendamentos não consomem sessões da sua quota.
                                    </p>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
