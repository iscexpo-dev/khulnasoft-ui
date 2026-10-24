/**
 * Implements a collapsible section in KhulnaSoft's Job viewer. Collapsed by default.
 *
 * Usage:
 *
 *     const section = new CiJobSection('My section header');
 *     ... various stuff that logs to stdout/stderr ...
 *     section.end();
 *
 * See https://docs.khulnasoft.com/ci/jobs/job_logs/#custom-collapsible-sections.
 */
export class CiJobSection {
  static ANSI_CLEAR_LINE = '\x1b[0K';

  static ANSI_CYAN_BOLD = '\x1b[36;1m';

  static ANSI_RESET = '\x1b[0;m';

  static counter = 1;

  static timestamp() {
    return Math.floor(Date.now() / 1000);
  }

  constructor(header, { collapsed = true } = {}) {
    this.header = header;
    this.name = `ci_job_section_${CiJobSection.counter}`;
    CiJobSection.counter += 1;

    console.log(
      [
        CiJobSection.ANSI_CLEAR_LINE,
        'section_start:',
        CiJobSection.timestamp(),
        ':',
        this.name,
        collapsed ? '[collapsed=true]' : '',
        '\r',
        CiJobSection.ANSI_CLEAR_LINE,
        CiJobSection.ANSI_CYAN_BOLD,
        header,
        CiJobSection.ANSI_RESET,
      ].join(''),
    );
  }

  end() {
    console.log(
      [
        CiJobSection.ANSI_CLEAR_LINE,
        'section_end:',
        CiJobSection.timestamp(),
        ':',
        this.name,
        '\r',
        CiJobSection.ANSI_CLEAR_LINE,
      ].join(''),
    );
  }
}
