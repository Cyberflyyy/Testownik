-- CreateTable
CREATE TABLE "WeeklyTestTime" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "weekStart" TIMESTAMP(3) NOT NULL,
    "totalTime" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WeeklyTestTime_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WeeklyTestTime_userId_weekStart_key" ON "WeeklyTestTime"("userId", "weekStart");

-- AddForeignKey
ALTER TABLE "WeeklyTestTime" ADD CONSTRAINT "WeeklyTestTime_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
