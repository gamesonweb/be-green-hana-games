export default class PlatfomUtil {
    public static isMac(): boolean {
        return navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    }
}