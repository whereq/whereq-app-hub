import PageLayout from "@layouts/PageLayout";

const About = () => {
  return (
    <PageLayout>
      <div className="pl-4 overflow-y-auto h-full">
        <h2 className="text-3xl font-bold mb-4 text-left">Time can fade everything</h2>
        <div className="text-orange-300">
          <table className="w-full mb-4">
            <thead>
              <tr>
                <th className="text-left">
                  Dazhi Zhang (Tony) <br />
                  <strong>Phone:</strong> (416) 835-**** <br />
                  <strong>Email:</strong> <a href="mailto:&#x67;&#x6f;&#x6f;&#x67;&#x6f;&#108;&#46;&#122;&#x68;&#97;&#x6e;&#x67;&#x40;&#103;&#109;&#x61;&#105;&#x6c;&#46;&#x63;&#x6f;&#x6d;" className="text-blue-400 hover:underline">
                    &#x67;&#x6f;&#x6f;&#x67;&#x6f;&#108;&#46;&#122;&#x68;&#97;&#x6e;&#x67;&#x40;&#103;&#109;&#x61;&#105;&#x6c;&#46;&#x63;&#x6f;&#x6d;
                  </a>
                </th>
                <th className="text-right">
                  <img src="https://whereq.github.io/images/pod/bacon-with-hat-transparent-bg.png" alt="Profile" width="49" />
                </th>
              </tr>
            </thead>
          </table>

          <h2 className="text-2xl font-bold mb-2 text-left">Senior Software Developer</h2>
          <p className="mb-4 text-left">
            A well-qualified software developer, a fast learner, a highly motivated self-starter, and a reliable person to work with.
          </p>

          <hr className="my-4 border-gray-700" />

          <h2 className="text-2xl font-bold mb-2 text-left">PROFESSIONAL EXPERIENCE</h2>

          <div className="mb-6">
            <h3 className="text-xl font-bold mb-2 text-left text-blue-400">
              <a href="https://www.whereq.com/" className="hover:underline">WhereQ Inc.</a>
            </h3>
            <p className="mb-2 text-left">
              <strong>Owner</strong> (2020 - Present)<br />
              Founded WhereQ Inc., specializing in web 2.0 applications for the Real Estate Industry. Additionally, offering OpenAI integration and practical applications.
            </p>
            <p className="mb-2 text-left"><strong>Key Achievements:</strong></p>
            <ul className="list-disc list-inside mb-4 text-left">
              <li>Implemented a <span className="text-blue-400">Java client</span> to interface with the Toronto Regional Real Estate Board (TREB) MLS for pulling selling data based on the IDX protocol.</li>
              <li>Constructed a scheduled batch service to retrieve selling data and display it on an integrated <span className="text-blue-400">Google Map</span> website.</li>
              <li>Designed and implemented a proprietary <span className="text-blue-400">image compression algorithm</span> to reduce Amazon S3 costs.</li>
              <li>Developed a <span className="text-blue-400">ChatGPT-like console</span> with categorized prompts and integrated Google Social Login.</li>
              <li>Built comprehensive API sets using <span className="text-blue-400">Spring WebFlux</span> for efficient communication with OpenAI endpoints.</li>
              <li>Established tech stack using <span className="text-blue-400">jHipster, React, Spring WebFlux, PostgreSQL, and Keycloak</span>.</li>
              <li>Orchestrated infrastructure setup on <span className="text-blue-400">AWS EC2 and RDS</span> for production services.</li>
            </ul>
            <p className="mb-4 text-left"><strong>Technical Environment:</strong><br />Amazon EC2, RDS, S3, Spring WebFlux, React, Keycloak, Angular, GIS, Google Map, MapStruct, Git, CI/CD, Social Login</p>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-bold mb-2 text-left text-blue-400">Scotiabank</h3>
            <p className="mb-2 text-left">
              <strong>Lead Engineer</strong> (04/2019 – Present)<br />
              As a tech leader and solution architect, I design solutions for the BNS data platform, focusing on big data streaming, metric collection, performance tuning, and automation.
            </p>
            <p className="mb-2 text-left"><strong>Key Achievements:</strong></p>
            <ul className="list-disc list-inside mb-4 text-left">
              <li>Designed and implemented “<span className="text-blue-400">Spark as a Service</span>” and an Avro/JSON flattener service.</li>
              <li>Developed lightweight scaffolding using <span className="text-blue-400">Spring Boot, R2DBC, and MapStruct</span> to simplify API development.</li>
              <li>Led the end-to-end solution design for data consumption using <span className="text-blue-400">Presto</span>, connecting various data sources like HDFS, ElasticSearch, and PostgreSQL.</li>
              <li>Developed ElasticSearch metrics tools and centralized business calendar services using <span className="text-blue-400">Node.js and PostgreSQL</span>.</li>
              <li>Reengineered Credit 360 application, improving performance, codebase, and validation frameworks.</li>
            </ul>
            <p className="mb-4 text-left"><strong>Technical Environment:</strong><br />Kubernetes, Docker, Presto, Spark, Kafka, HDFS, ElasticSearch, Power BI, Java, Spring Boot, Angular, MongoDB, Jenkins, PostgreSQL, Git</p>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-bold mb-2 text-left text-blue-400">TD Bank</h3>
            <p className="mb-2 text-left">
              <strong>Senior Software Developer</strong> (11/2018 – 04/2019)<br />
              Developed new features and contributed to the EasyApply program, focusing on Java backend systems and automated testing frameworks.
            </p>
            <p className="mb-2 text-left"><strong>Key Achievements:</strong></p>
            <ul className="list-disc list-inside mb-4 text-left">
              <li>Introduced POJO generation from JSON schemas for validation purposes.</li>
              <li>Developed a retry module using Java 8’s Functional Interfaces and template method design pattern.</li>
              <li>Built 10 new API endpoints within three months and refactored existing components.</li>
            </ul>
            <p className="mb-4 text-left"><strong>Technical Environment:</strong><br />Java, Spring, Oracle 12c, Jenkins, Postman, MQ, Git, Hibernate</p>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-bold mb-2 text-left text-blue-400">Rogers Communications Inc.</h3>
            <p className="mb-2 text-left">
              <strong>Senior Software Developer</strong> (08/2016 – 09/2018)<br />
              As a full-stack developer and architect, I led the evolution of the Enterprise Notification System (ENS), improving performance and introducing new features.
            </p>
            <p className="mb-2 text-left"><strong>Key Achievements:</strong></p>
            <ul className="list-disc list-inside mb-4 text-left">
              <li>Integrated an SMS Gateway using <span className="text-blue-400">SMPP protocol</span> to enhance SMS delivery performance.</li>
              <li>Re-architected the ENS for better scalability, handling over a million email notifications per hour.</li>
              <li>Introduced RESTful interfaces and optimized system performance.</li>
            </ul>
            <p className="mb-4 text-left"><strong>Technical Environment:</strong><br />SMPP, Spring, Hibernate, WebLogic, Oracle, JUnit, Ant, Jenkins, SVN</p>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-bold mb-2 text-left text-blue-400">Citibank</h3>
            <p className="mb-2 text-left">
              <strong>Senior Consultant</strong> (09/2012 – 08/2016)<br />
              Collaborated with teams across the U.S. and India, leading multiple Java-based development projects for the Market Risk department.
            </p>
            <p className="mb-2 text-left"><strong>Key Achievements:</strong></p>
            <ul className="list-disc list-inside mb-4 text-left">
              <li>Developed portfolio management and reporting applications using <span className="text-blue-400">Adobe Flex and Java</span>.</li>
              <li>Built a report transformation engine using <span className="text-blue-400">JEXL</span> and designed batch jobs for intraday feed processing.</li>
              <li>Migrated Flex applications to single-page applications using <span className="text-blue-400">ExtJS and Spring Boot</span>.</li>
            </ul>
            <p className="mb-4 text-left"><strong>Technical Environment:</strong><br />Java, JMS, Kafka, Jenkins, ExtJS, Spring Boot, Hibernate, Oracle, AWS</p>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-bold mb-2 text-left text-blue-400">Rogers Communications Inc.</h3>
            <p className="mb-2 text-left">
              <strong>Senior Programmer Analyst</strong> (07/2010 – 07/2012)<br />
              Collaborated with project stakeholders to develop and deliver applications supporting business needs.
            </p>
            <p className="mb-2 text-left"><strong>Key Achievements:</strong></p>
            <ul className="list-disc list-inside mb-4 text-left">
              <li>Enhanced the ENS to support MMS delivery.</li>
              <li>Developed SMS/MMS template generators using <span className="text-blue-400">Apache Velocity and Java Regex</span>.</li>
            </ul>
            <p className="mb-4 text-left"><strong>Technical Environment:</strong><br />Java, Adobe LiveCycle, Oracle, Spring, Hibernate, WebLogic</p>
          </div>

          <hr className="my-4 border-gray-700" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="bg-gray-700 p-4 rounded-md grid grid-cols-[10%_auto] grid-rows-2 gap-2 text-left">
              <img src="https://whereq.github.io/images/logo/whereq-cc.png" alt="WhereQ - LLM" width="49" className="row-span-2" />
              <p>WhereQ - LLM</p>
              <a href="https://whereq.cc/" target="_blank" rel="noopener" className="text-blue-400 hover:underline">https://www.whereq.cc</a>
            </div>
            <div className="bg-gray-700 p-4 rounded-md grid grid-cols-[10%_auto] grid-rows-2 gap-2 text-left">
              <img src="https://whereq.github.io/images/logo/whereq-com.png" alt="WhereQ - Real Estate 3.x" width="49" className="row-span-2" />
              <p>WhereQ - Real Estate 3.x</p>
              <a href="https://whereq.com/" target="_blank" rel="noopener" className="text-blue-400 hover:underline">https://www.whereq.com</a>
            </div>
            <div className="bg-gray-700 p-4 rounded-md grid grid-cols-[10%_auto] grid-rows-2 gap-2 text-left">
              <img src="https://whereq.github.io/images/logo/key-to-marvel.png" alt="Key To Marvel" width="49" className="row-span-2" />
              <p>Key To Marvel</p>
              <a href="https://keytomarvel.com/" target="_blank" rel="noopener" className="text-blue-400 hover:underline">https://www.keytomarvel.com</a>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default About;