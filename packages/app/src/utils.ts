import { Ref, ref, unref } from 'vue';

function alignNumber(value: number) {
  return (value < 10 ? '0' : '') + value;
}

export function toDate(seconds: number | Ref<number>) {
  const date = new Date(unref(seconds) * 1000);
  const prefix = `${date.getFullYear()}-${alignNumber(
    date.getMonth() + 1
  )}-${alignNumber(date.getDate())} `;
  const hours = alignNumber(date.getHours());
  const minutes = alignNumber(date.getMinutes());
  return ref(prefix + hours + ':' + minutes);
}

export function toNumDuration(duration: number | Ref<number>) {
  const seconds = unref(duration);
  const hour = Math.floor(seconds / 3600);
  const minute = Math.floor((seconds % 3600) / 60);
  const second = Math.floor(seconds % 60);
  return ref(`${hour}:${alignNumber(minute)}:${alignNumber(second)}`);
}

export function toDuration(duration: number | Ref<number>) {
  const seconds = unref(duration);
  const hour = Math.floor(seconds / 3600);
  const minute = Math.floor((seconds % 3600) / 60);
  const second = Math.floor(seconds % 60);
  return ref(
    [
      hour > 0 ? hour + ' 小时' : '',
      minute > 0 ? minute + ' 分钟' : '',
      second > 0 ? second + ' 秒' : ''
    ].join(' ')
  );
}
