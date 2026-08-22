-- AlterTable
ALTER TABLE "User" ADD COLUMN     "weekDays" INTEGER[] DEFAULT ARRAY[1, 2, 3, 4, 5]::INTEGER[];
