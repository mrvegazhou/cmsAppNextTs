import styles from "./svgLoading.module.scss";

interface propsType {
}
const SvgLoading = (props: propsType) => {
    return (
        <div className={styles.loadingTipsNested}>
            <svg viewBox="25 25 50 50">
                <circle cx="50" cy="50" r="20" fill="none" strokeWidth="5" strokeMiterlimit="10" />
            </svg>
        </div>
    );
};