import { CalendarDays, LineChart, Users } from "lucide-react";
import AuthCard from "./auth-card";

const SignUpCard = () => {
  return <AuthCard type="signup" />;
};

// const Feature = ({
//   title,
//   desc,
//   icon,
// }: {
//   title: string;
//   desc: string;
//   icon: React.ReactNode;
// }) => (
//   <div>
//     <div className="flex flex-row gap-4 items-center mb-2">
//       {icon}
//       <h3 className="font-semibold text-lg">{title}</h3>{" "}
//       {/* Font-size artırıldı */}
//     </div>
//     <p className="text-base font-light opacity-90 max-w-[400px]">
//       {" "}
//       {/* Font-size, kalınlık ve opaklık ayarlandı */}
//       {desc}
//     </p>
//   </div>
// );

export default SignUpCard;
