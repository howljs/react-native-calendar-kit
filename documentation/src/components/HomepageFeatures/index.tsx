import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  image: string | undefined;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Week',
    image: require('@site/static/img/week.png').default,
  },
  {
    title: 'Day',
    image: require('@site/static/img/day.png').default,
  },
  {
    title: '3-days',
    image: require('@site/static/img/3-days.png').default,
  },
  {
    title: 'Work week',
    image: require('@site/static/img/work-week.png').default,
  },
];

function Feature({ title, image }: FeatureItem) {
  return (
    <div className={clsx('col col--3')}>
      <div className="text--center">
        <img className={styles.featureImg} src={image} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <h3>{title}</h3>
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
