import Image from 'next/image';
import styles from "./avatarPop.module.scss";
import classNames from 'classnames';

interface propsType {
}
const AvatarPop = (props: propsType) => {
    return (
        <div className={styles.headerContainer}>
            <div className={styles.headerInfo}>
                <a target="_blank" rel="" className={styles.avatarLink}>
                    <div className={styles.avatar}>
                        <Image className="lazy avatar-img" width={45} height={45} src="https://p6-passport.byteacctimg.com/img/user-avatar/bf20c4e6b3d7eb47c99024ab3520513f~200x200.awebp" alt="nullable的头像" /> 
                    </div>
                </a>
                <div className={styles.userInfo}>
                    <a target="_blank" className={styles.username}>
                        nullablexxxxxxxxxxxxxxxxxxxxxx
                    </a> 
                    <div className={styles.position}>准全栈工程师 @色魔张大妈</div>
                </div>
            </div>
            <div className={styles.metaInfo}>
                <div className={styles.metaItem}>
                    <div className={classNames(styles.count, 'text-muted')}>95</div>
                    <div className={classNames(styles.title, 'text-muted')}>关注</div>
                </div>
                <div className="vr" style={{height: '1.5rem', alignSelf: 'center'}}></div>
                <div className={styles.metaItem}>
                    <div className={classNames(styles.count, 'text-muted')}>16</div>
                    <div className={classNames(styles.title, 'text-muted')}>粉丝</div>
                </div>
            </div>
            <div className={styles.operateBtn}>
                <a href="#" role="button" className="btn btn-outline-primary btn-sm">
                    关注
                </a> 
                <a href="#" role="button" className="btn btn-outline-primary btn-sm">
                    <div data-v-314ccdfc="">私信</div>
                </a>
            </div>
        </div>
    );
}
export default AvatarPop;