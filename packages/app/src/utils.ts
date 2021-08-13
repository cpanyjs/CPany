import { Ref, ref, unref } from 'vue';

export function toDate(seconds: number | Ref<number>) {
  const date = new Date(unref(seconds) * 1000);
  const prefix = `${date.getFullYear()}-${
    date.getMonth() + 1
  }-${date.getDate()} `;
  const hours = (date.getHours() < 10 ? '0' : '') + date.getHours();
  const minutes = (date.getMinutes() < 10 ? '0' : '') + date.getMinutes();
  return ref(prefix + hours + ':' + minutes);
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
