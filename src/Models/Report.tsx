export type ReportGet = {
    reportId: string;
    appUserId: string;
    strategyName: string;
    resultJson: string;
}


export type ReportCreate = {
    appUserId: string;
    strategyName: string;
    resultJson: string;
}