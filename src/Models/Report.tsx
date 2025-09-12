export type ReportGet = {
    id: string;
    title: string;
    appUserId: string;
    startname: string;
    endname: string;
    metrics_json: JSON;
    chartbase: string;
    positions_json: JSON;
    createdAt: Date;
    updatedAt: Date;
}


export type ReportCreate = {
    title: string;
    appUserId: string;
    startname: string;
    endname: string;
    metrics_json: JSON;
    chartbase: string;
    positions_json: JSON;
}