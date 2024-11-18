import Heading from '@theme/Heading';
import clsx from 'clsx';

import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  Svg: React.ComponentType<React.ComponentProps<'svg'>>;
  description: JSX.Element;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Multiple view types',
    Svg: require('@site/static/img/undraw_docusaurus_tree.svg').default,
    description: <>Support for different calendar views (e.g., day, 3-days, week).</>,
  },
  {
    title: 'Drag and drop functionality',
    Svg: require('@site/static/img/undraw_docusaurus_tree.svg').default,
    description: <>Support drag and drop functionality for creating and editing events.</>,
  },
  {
    title: 'Pinch-to-zoom capability',
    Svg: require('@site/static/img/undraw_docusaurus_tree.svg').default,
    description: <>Support pinch-to-zoom functionality for better event visibility.</>,
  },
  {
    title: 'Timezone support',
    Svg: require('@site/static/img/undraw_docusaurus_tree.svg').default,
    description: <>The calendar can handle different timezones.</>,
  },
  {
    title: 'Recurring events',
    Svg: require('@site/static/img/undraw_docusaurus_tree.svg').default,
    description: <>The library has support for handling recurring events.</>,
  },
  {
    title: 'Support for all-day events',
    Svg: require('@site/static/img/undraw_docusaurus_tree.svg').default,
    description: <>The library can handle and display all-day events.</>,
  },
];

function Feature({ title, Svg, description }: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): JSX.Element {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
