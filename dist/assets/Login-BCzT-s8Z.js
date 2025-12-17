import{r as o,u as d,a as c,j as e,G as p}from"./index-CuCGNzQz.js";function g(){const[i,n]=o.useState(""),{googleLogin:l,user:t}=d(),a=c();return o.useEffect(()=>{t&&(t.hasSeenWelcome?a("/dashboard"):a("/welcome"))},[t,a]),e.jsxs("div",{className:"login-container",style:{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:"2rem",position:"relative",zIndex:10},children:[e.jsx("div",{style:{position:"absolute",top:"20%",left:"50%",transform:"translate(-50%, -50%)",width:"500px",height:"500px",background:"radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)",borderRadius:"50%",filter:"blur(60px)",animation:"pulse 4s ease-in-out infinite",pointerEvents:"none"}}),e.jsxs("div",{className:"glass-panel animate-pop-in",style:{maxWidth:"480px",width:"100%",padding:"4rem 3rem",textAlign:"center",display:"flex",flexDirection:"column",alignItems:"center",background:"rgba(30, 41, 59, 0.6)",backdropFilter:"blur(20px)",borderRadius:"24px",border:"1px solid rgba(255, 255, 255, 0.1)",borderTop:"1px solid rgba(255, 255, 255, 0.2)",boxShadow:"0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 60px rgba(59, 130, 246, 0.15)",position:"relative",overflow:"hidden"},children:[e.jsx("div",{style:{position:"absolute",top:0,left:0,right:0,height:"1px",background:"linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.5), transparent)"}}),e.jsx("div",{className:"rocket-icon-wrapper animate-float",style:{fontSize:"4.5rem",color:"var(--accent-primary)",marginBottom:"2rem",filter:"drop-shadow(0 0 30px rgba(59, 130, 246, 0.5))",animation:"float 3s ease-in-out infinite"},children:e.jsx("i",{className:"fa-solid fa-rocket"})}),e.jsxs("h1",{style:{fontSize:"3rem",fontWeight:"800",letterSpacing:"-0.03em",marginBottom:"0.5rem",background:"linear-gradient(135deg, #ffffff 0%, #94a3b8 100%)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"},children:["The ",e.jsx("span",{style:{color:"var(--accent-primary)",background:"none",WebkitTextFillColor:"var(--accent-primary)"},children:"Grind"})]}),e.jsx("p",{style:{fontSize:"1.125rem",color:"var(--text-secondary)",marginBottom:"1rem",fontWeight:"400",lineHeight:"1.6"},children:"Track Applications. Conquer Goals."}),e.jsx("div",{style:{width:"60px",height:"2px",background:"linear-gradient(90deg, transparent, var(--accent-primary), transparent)",marginBottom:"2.5rem",borderRadius:"2px"}}),i&&e.jsxs("div",{style:{width:"100%",padding:"1rem 1.25rem",marginBottom:"2rem",borderRadius:"12px",background:"rgba(239, 68, 68, 0.1)",border:"1px solid rgba(239, 68, 68, 0.3)",color:"#fca5a5",fontSize:"0.95rem",display:"flex",alignItems:"center",gap:"0.75rem",animation:"shake 0.4s ease-in-out"},children:[e.jsx("i",{className:"fa-solid fa-circle-exclamation"}),e.jsx("span",{children:i})]}),e.jsxs("div",{style:{width:"100%",marginBottom:"1.5rem"},children:[e.jsx("p",{style:{fontSize:"0.875rem",color:"var(--text-tertiary)",marginBottom:"1.5rem",fontWeight:"500",textTransform:"uppercase",letterSpacing:"0.05em"},children:"Sign in to continue"}),e.jsx("div",{style:{display:"flex",justifyContent:"center",transform:"scale(1)",transition:"transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)"},onMouseEnter:r=>r.currentTarget.style.transform="scale(1.05)",onMouseLeave:r=>r.currentTarget.style.transform="scale(1)",children:e.jsx(p,{onSuccess:async r=>{const s=await l(r);s.success||n(s.message)},onError:()=>n("Authentication failed. Please try again."),theme:"filled_black",shape:"pill",text:"continue_with",size:"large",width:"320"})})]}),e.jsxs("div",{style:{width:"100%",padding:"1rem",marginTop:"1rem",borderRadius:"12px",background:"rgba(59, 130, 246, 0.05)",border:"1px solid rgba(59, 130, 246, 0.15)",display:"flex",alignItems:"center",gap:"0.75rem",fontSize:"0.875rem",color:"var(--text-secondary)",lineHeight:"1.5"},children:[e.jsx("i",{className:"fa-solid fa-shield-halved",style:{color:"var(--accent-primary)",fontSize:"1rem"}}),e.jsx("span",{children:"Secure authentication powered by Google"})]}),e.jsx("div",{style:{marginTop:"2.5rem",paddingTop:"2rem",borderTop:"1px solid rgba(255, 255, 255, 0.05)",width:"100%"},children:e.jsx("p",{style:{fontSize:"0.75rem",color:"var(--text-tertiary)",opacity:.6,fontWeight:"400",letterSpacing:"0.05em"},children:"Secure Access v2.0 • Grind System"})})]}),e.jsx("style",{children:`
                @keyframes float {
                    0%, 100% {
                        transform: translateY(0px) rotate(0deg);
                    }
                    50% {
                        transform: translateY(-20px) rotate(5deg);
                    }
                }

                @keyframes pulse {
                    0%, 100% {
                        opacity: 0.15;
                        transform: translate(-50%, -50%) scale(1);
                    }
                    50% {
                        opacity: 0.25;
                        transform: translate(-50%, -50%) scale(1.1);
                    }
                }

                @keyframes pop-in {
                    0% {
                        opacity: 0;
                        transform: scale(0.9) translateY(20px);
                    }
                    100% {
                        opacity: 1;
                        transform: scale(1) translateY(0);
                    }
                }

                .animate-pop-in {
                    animation: pop-in 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
                }

                /* Responsive adjustments */
                @media (max-width: 640px) {
                    .login-container {
                        padding: 1rem !important;
                    }
                    .glass-panel {
                        padding: 3rem 2rem !important;
                        max-width: 100% !important;
                    }
                }
            `})]})}export{g as default};
