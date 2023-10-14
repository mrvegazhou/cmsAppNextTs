import BackTopComp from '@/components/backTop/backTop';
import styled from "styled-components";

const DivCom = styled.div`
    position:absolute;
    top:0px;
    display:flex;
    height:100%;
    width:100%;   
    align-items:center;
    justify-content:center;
    color:rgb(255, 255, 255);
`

export default function BackTopPage() {
    return (
        <>
            <BackTopComp speed={10} style={{width:"50px", height: "50px"}}>
                {({ percent, scrollToTop }) => (
                <>
                    <svg viewBox="0 0 35 35" width="50" height="50" focusable="false" style={{display: "block", transform: "rotate(-90deg)"}}>
                        <circle fill="rgb(255 255 255 / 50%)" stroke="rgb(200 200 200 / 90%)" strokeWidth="2" r="16" cx="17.5" cy="17.5"></circle>
                        <circle fill="none" stroke="rgb(255 255 255)" strokeWidth="2" r="16" cx="17.5" cy="17.5" strokeDasharray="100" strokeDashoffset={percent} style={{transition: "stroke-dashoffset 0.3s linear 0s"}}></circle>
                    </svg>
                    <DivCom>
                    <strong><i className="iconfont icon-arrowTop-fill fs-2 text-secondary opacity-50"></i></strong>
                    </DivCom>
                </>
                )}
            </BackTopComp>
        </>
    )
}