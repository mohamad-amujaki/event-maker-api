import { prisma } from "../../utils/prisma.js";

export const getEvents = async () => {
  return await prisma.event.findMany({
    include: {
      participants: {
        select: { name: true, email: true },
      },
    },
  });
};

export const getEventById = async (id: number) => {
  return await prisma.event.findUnique({
    where: { id },
  });
};

export const createEvent = async (data: {
  title: string;
  description?: string;
  date: string;
  location: string;
}) => {
  const date = new Date(data.date);
  if (isNaN(date.getTime())) {
    throw new Error("Format tanggal tidak sesuai");
  }
  return await prisma.event.create({
    data: {
      title: data.title,
      description: data.description,
      date: date,
      location: data.location,
    },
  });
};

export const updateEvent = async (
  id: number,
  data: Partial<{
    title: string;
    description: string;
    date: string;
    location: string;
  }>
) => {
  const updateData: any = {};
  if (data.title) updateData.title = data.title;
  if (data.description) updateData.description = data.description;
  if (data.date) {
    const date = new Date(data.date);
    if (isNaN(date.getTime())) {
      throw new Error("Format tanggal tidak sesuai");
    }
    updateData.date = date;
  }
  if (data.location) updateData.location = data.location;

  return await prisma.event.update({
    where: { id },
    data: updateData,
    include: {
      participants: {
        select: { name: true },
      },
    },
  });
};

export const deleteEvent = async (id: number) => {
  return await prisma.event.delete({
    where: { id },
  });
};
