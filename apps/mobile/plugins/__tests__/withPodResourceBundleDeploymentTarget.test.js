// The iOS release archive must not fail on a pod resource bundle Xcode refuses.
// These tests pin the transform the config plugin applies to the Expo Podfile
// template, and prove the committed ios/Podfile is still in sync with it.

const fs = require('fs');
const path = require('path');
const { addResourceBundleDeploymentTarget } = require('../withPodResourceBundleDeploymentTarget');

const TEMPLATE = `target 'SpeakForMe' do
  use_expo_modules!

  post_install do |installer|
    react_native_post_install(
      installer,
      config[:reactNativePath],
      :mac_catalyst_enabled => false,
      :ccache_enabled => ccache_enabled?(podfile_properties),
    )
  end
end
`;

describe('addResourceBundleDeploymentTarget', () => {
  const output = addResourceBundleDeploymentTarget(TEMPLATE);

  it('raises resource bundle targets after React Native has raised the pod targets', () => {
    const block = output.indexOf('result.resource_bundle_targets.each');
    expect(block).toBeGreaterThan(output.indexOf('react_native_post_install('));
    expect(block).toBeLessThan(output.indexOf('\n  end\nend'));
    expect(output).toContain("build_config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] =");
    expect(output).toContain('Helpers::Constants.min_ios_version_supported');
  });

  it('never lowers a target that is already higher', () => {
    expect(output).toContain('[Helpers::Constants.min_ios_version_supported.to_f, current.to_f].max.to_s');
  });

  it('is idempotent, so prebuild can run again on a committed native project', () => {
    expect(addResourceBundleDeploymentTarget(output)).toBe(output);
  });

  it('replaces a stale generated block instead of stacking a second one', () => {
    const stale = output.replace('result.resource_bundle_targets.each', 'result.old_name.each');
    const refreshed = addResourceBundleDeploymentTarget(stale);
    expect(refreshed).toBe(output);
    expect(refreshed.match(/speak-for-me resource bundle deployment target \(generated/g)).toHaveLength(1);
  });

  it('refuses to guess when the Expo template no longer has the expected anchors', () => {
    expect(() => addResourceBundleDeploymentTarget(TEMPLATE.replace('react_native_post_install(', 'other('))).toThrow(
      /could not find the react_native_post_install call/
    );
  });
});

describe('the committed ios project', () => {
  const podfile = path.join(__dirname, '..', '..', 'ios', 'Podfile');

  it('already carries the resource bundle fix (run `npx expo prebuild --platform ios` if this fails)', () => {
    const contents = fs.readFileSync(podfile, 'utf8');
    expect(addResourceBundleDeploymentTarget(contents)).toBe(contents);
  });
});
