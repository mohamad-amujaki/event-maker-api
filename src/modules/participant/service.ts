import { prisma } from "../../utils/prisma.js";

export const getParticipants = async () => {
  return await prisma.participant.findMany();
};

export const getParticipanById = async (id: number) => {
  return await prisma.participant.findUnique({
    where: { id },
  });
};

export const createParticipant = async (data: {
  name: string;
  email: string;
  eventId: number;
}) => {
  return await prisma.participant.create({
    data: {
      name: data.name,
      email: data.email,
      eventId: data.eventId,
    },
  });
};

export const updateParticipant = async (
  id: number,
  data: Partial<{
    name: string;
    email: string;
    eventId: number;
  }>
) => {
  const updateData: any = {};
  if (data.name) updateData.name = data.name;
  if (data.email) updateData.email = data.email;
  if (data.eventId) updateData.eventId = data.eventId;

  return await prisma.participant.update({
    where: { id },
    data: updateData,
  });
};

export const deleteParticipant = async (id: number) => {
  return await prisma.participant.delete({
    where: { id },
  });
};
