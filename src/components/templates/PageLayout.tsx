import { FC, ReactNode } from "react";
import { PageHead, Header, Footer } from "@components";
import { motion } from "framer-motion";
import { enterAnimation } from "@constants";

interface Props {
  children: ReactNode;
}

const PageLayout: FC<Props> = (props: Props) => {
  const { children } = props;
  return (
    <motion.div
      className="relative flex flex-col w-screen lg:min-h-screen justify-start "
      {...enterAnimation}
    >
      <PageHead
        title="Liberty Square"
        description="Liberty Square tickets at Berrics, LA"
      />

      {/* <Header /> */}
      <main className="h-full w-full">{children}</main>
      {/* <Footer /> */}
    </motion.div>
  );
};
export default PageLayout;
