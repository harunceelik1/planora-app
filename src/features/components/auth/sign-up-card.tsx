import { CalendarDays } from "lucide-react";
import { ChartArea } from "lucide-react";
import { Users } from "lucide-react";
import AuthCard from "./auth-card";

const SignUpCard = () => {
  return (
    <div className="flex flex-col md:flex-row w-full h-screen  ">
      {/* Sol bilgi kısmı */}
      <div className="flex flex-col justify-center md:w-1/2 p-10 space-y-6">
        <h1 className="text-3xl font-semibold mb-8">Planora</h1>

        <div className="space-y-6 ">
          <Feature
            icon={<CalendarDays className="size-5 text-indigo-400" />}
            title="Görev Yönetimi"
            desc="Görev oluştur, ata ve ilerlemeyi takip et. Ekibindeki herkesin ne yaptığını kolayca gör."
          />
          <Feature
            icon={<ChartArea className="size-5 text-indigo-400" />}
            title="Zaman Çizelgesi"
            desc="Teslim tarihlerini ve önemli kilometre taşlarını zaman çizelgesi üzerinden takip et."
          />
          <Feature
            icon={<Users className="size-5 text-indigo-400" />}
            title="Ekip İş Birliği"
            desc="Ekibinle gerçek zamanlı çalış, görevleri paylaş ve bildirimlerle iletişimi güçlendir."
          />
        </div>
      </div>

      {/* Sağ AuthCard kısmı */}
      <div className="flex justify-center items-center md:w-1/2   ">
        <div className="p-8 w-full max-w-md">
          <AuthCard type="signup" />
        </div>
      </div>
    </div>
  );
};
// Küçük bilgi maddesi bileşeni
const Feature = ({
  title,
  desc,
  icon,
}: {
  title: string;
  desc: string;
  icon: React.ReactNode;
}) => (
  <div>
    <div className="flex flex-row gap-3 items-center mb-1">
      {icon}
      <h3 className="font-medium text-">{title}</h3>
    </div>
    <p className="text-sm text-gray-400 max-w-[240px] sm:max-w-[300px] md:max-w-[360px] lg:max-w-[450px]">
      {desc}
    </p>
  </div>
);

export default SignUpCard;
