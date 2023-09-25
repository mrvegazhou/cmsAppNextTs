import { useTranslations } from 'use-intl';

const Avatar = () => {
    const t = useTranslations('Navbar');
    return (
        <>
            <div className="dropdown">
                <a href="#" role="button" id="dropdownLoginLink" data-bs-toggle="dropdown" aria-expanded="false">
                    <img src="https://fastbootstrap.com/images/avatar/2.jpg" loading="lazy" className="bg-info rounded-circle shadow-4" style={{ width: "35px"}} />
                </a>
                <ul className="dropdown-menu" aria-labelledby="dropdownLoginLink" style={{left:"auto", right: 0}}>
                    <li><a className="dropdown-item" href="#"><i className="iconfont icon-gerenzhongxin fs-6 pe-2" />{t('profile')}</a></li>
                    <li><a className="dropdown-item" href="#"><i className="iconfont icon-tuichu fs-6 pe-2" />{t('logout')}</a></li>
                </ul>
            </div>
        </>
    );
};

export default Avatar;