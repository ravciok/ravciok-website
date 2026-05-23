const UCARE_BASE = "https://5qcsm3rhzn.ucarecd.net";

function ops(uuid: string, op: string): string {
  return `${UCARE_BASE}/${uuid}/-/${op}/-/format/auto/-/quality/smart/`;
}

export function ucareSquare(uuid: string, size: number): string {
  return ops(uuid, `scale_crop/${size}x${size}/center`);
}

export function ucareCrop(uuid: string, width: number, height: number, align: string): string {
  return ops(uuid, `scale_crop/${width}x${height}/${align}`);
}

export function ucareResize(uuid: string, width: number, height: number): string {
  return ops(uuid, `smart_resize/${width}x${height}/center`);
}
