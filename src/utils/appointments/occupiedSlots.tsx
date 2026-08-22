export function getOccupiedSlots(startTime: string, durationInMinutes: number): string[] {
    const slots: string[] = [];

    // CORREÇÃO DE SEGURANÇA: Remove os segundos ":00" se o banco trouxer "16:00:00"
    const cleanedTime = startTime.split(":").slice(0, 2).join(":");

    const [startHour, startMin] = cleanedTime.split(":").map(Number);
    let currentTotalMinutes = (startHour * 60) + startMin;
    const endTotalMinutes = currentTotalMinutes + durationInMinutes;

    while (currentTotalMinutes < endTotalMinutes) {
        const hour = Math.floor(currentTotalMinutes / 60).toString().padStart(2, "0");
        const minute = (currentTotalMinutes % 60).toString().padStart(2, "0");
        slots.push(`${hour}:${minute}`);
        currentTotalMinutes += 30;
    }

    return slots;
}

export function generateBlockedTimes(appointments: any[]): Set<string> {
    const blockedTimes = new Set<string>();

    appointments.forEach((apt) => {
        // CORREÇÃO: Força remover os segundos (:00) se o banco trouxer "16:00:00"
        const cleanedTime = apt.time.split(":").slice(0, 2).join(":");

        // Calcula a duração correta (se a duração vier zerada do banco, assume o mínimo de 30min)
        const duration = apt.service?.duration && apt.service.duration > 0
            ? apt.service.duration
            : 30;

        const slotsCount = Math.ceil(duration / 30);
        const [startHour, startMin] = cleanedTime.split(":").map(Number);
        let totalMinutes = (startHour * 60) + startMin;

        for (let i = 0; i < slotsCount; i++) {
            const hour = Math.floor(totalMinutes / 60).toString().padStart(2, "0");
            const minute = (totalMinutes % 60).toString().padStart(2, "0");
            const currentSlot = `${hour}:${minute}`;

            blockedTimes.add(currentSlot); // Bloqueia o slot de 30 minutos na lista do cliente
            totalMinutes += 30;
        }
    });

    return blockedTimes;
}