import React from "react";

export default function useQuestionQueue() {
    const [queue, setQueue] = React.useState<QuestionQueue[]>([]);

    setInterval(() => {
        // fetch queue
    }, 5000);

    function addQueue(data: QuestionQueue) {
        if (queue.find(x => x.entryId == data.entryId)) return;
        setQueue(d => [...d, data]);
    }

    function removeQueue(id: number) {
        setQueue(d => d.filter(x => x.entryId != id));
    }

    return {queue, addQueue, removeQueue};
}

export interface QuestionQueue {
    entryId: number;
    status: 'PROCESSING' | 'DONE';
}