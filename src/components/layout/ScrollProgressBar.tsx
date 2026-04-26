import { motion, useTransform } from "framer-motion";
import { useLenis } from "../../context/LenisContext";
import styles from "./ScrollProgressBar.module.css";

export default function ScrollProgressBar() {
  const { scrollProgress } = useLenis();

  const scaleY = useTransform(scrollProgress, [0, 1], [0, 1]);

  return (
    <div className={styles.track} aria-hidden="true">
      <motion.div className={styles.fill} style={{ scaleY }} />
    </div>
  );
}
