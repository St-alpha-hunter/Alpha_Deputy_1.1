import { Link } from "react-router-dom";
import hero08 from "./hero08.png"
import { useTranslation } from 'react-i18next'
import i18n from 'i18next';

interface Props {}

const Hero = (props: Props) => {
  const { t } = useTranslation();
  const isZh = i18n.language === "zh";
  return (
    <section id="hero">
            <div className="container flex flex-col-reverse mx-auto p-8 lg:flex-row">
                <div className="flex flex-col space-y-10 mb-44 m-10 lg:m-10 xl:m-20 lg:mt:16 lg:w-1/2 xl:mb-52">
                       
                   {isZh ? (
                      <>
                         <h1 className="text-5xl font-bold text-center lg:text-6xl lg:max-w-md lg:text-left tracking-[0.03em] leading-[1.1]">
                          {t('heroTitleLine1')}
                        </h1>
                        <h1 className="text-xl font-bold text-center mt-1 lg:text-4xl lg:max-w-md tracking-[0.03em] leading-[1.1]">
                          {t('heroTitleLine2')}
                        </h1>
                      </>
                   ):(
                        <h1 className="text-5xl font-bold text-center lg:text-6xl lg:max-w-md lg:text-left">
                          Empower Your Team to Capture Alpha
                        </h1>

                   )
                  }


                        <p className="text-2xl text-center text-gray-500 lg:max-w-md lg:text-left">
                          {t('description')}
                        </p>
                        <div className="mx-auto lg:mx-0">
                            <Link
                              to="/search"
                              className="py-5 px-10 text-2xl font-bold text-white bg-lightGreen rounded lg:py-4 hover:opacity-70"
                            >
                              {t('buttonOnHero')}
                            </Link>
                        </div>
                </div>
                <div className="mb-24 mx-auto md:w-180 md:px-10 lg:mb-0 lg:w-1/2">
                  <img src={hero08} alt="" />
                </div>
            </div>
    </section>
  );
};

export default Hero